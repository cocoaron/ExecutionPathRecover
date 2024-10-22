import re
from collections import namedtuple
from exec_pth_rec.shell_syntax_parser import check_msg_list
import os
import configs.analysis_config as config
import subprocess
import json

class BinaryParser:

    def ascii_strings(self, buf, ASCII_BYTE, String, n=4):
        reg = rb"([%s]{%d,})" % (ASCII_BYTE, n)
        ascii_re = re.compile(reg)
        for match in ascii_re.finditer(buf):
            yield String(match.group().decode("ascii"), match.start())

    def unicode_strings(self, buf, ASCII_BYTE, String, n=4):
        reg = rb"((?:[%s]\x00){%d,})" % (ASCII_BYTE, n)
        uni_re = re.compile(reg)
        for match in uni_re.finditer(buf):
            try:
                yield String(match.group().decode("utf-16"), match.start())
            except UnicodeDecodeError:
                pass

    def get_string(self, filepath):
        with open(filepath, 'rb') as f:
            b = f.read()
        strs = []

        ASCII_BYTE = rb" !\"#\$%&\'\(\)\*\+,-\./0123456789:;<=>\?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\]\^_`abcdefghijklmnopqrstuvwxyz\{\|\}\\\~\t"
        String = namedtuple("String", ["s", "offset"])
        
        for s in self.ascii_strings(b, ASCII_BYTE, String):
            strs.append(s.s)

        for s in self.unicode_strings(b, ASCII_BYTE, String):
            strs.append(s.s)
    
        return strs

    def search_parameter(self, parameters, strs):
        results = set()
        for para in parameters:
            for str in strs:
                if str.lower() == para.lower():
                    results.add(para)
                    break
        return list(results)

    def search_function(self, functions, strs):
        results = set()
        for func in functions:
            func = func.split("/")[-1]
            for str in strs:
                if str.find(func) >= 0:
                    results.add(func)
                    break
        return list(results)

    def search_pattern(self, strs):
        results = set()  # To store unique results

        # Define independent patterns
        pattern1 = re.compile(r"^(?=.*?firmware|fw).*$", re.I | re.M)  # Matches 'firmware' or 'fw'
        pattern2 = re.compile(r"^(?=.*?upd|upg|upgrade|update).*$", re.I | re.M)      # Matches 'upd' or 'upg'
        pattern3 = re.compile(r"^(?=.*?ver|check|digest|md5|sha256|sign|cert|crc|version|fail).*$", re.I | re.M)  # Matches 'ver', 'check', etc.

        # Check each string against all patterns, and add matches to results
        for string in strs:
            if not isinstance(string, str):
                continue  # Skip non-string items
            if pattern1.search(string):  # If the string matches pattern1
                results.add(string)      # Add to results
            if pattern2.search(string):  # If the string matches pattern2
                results.add(string)      # Add to results
            if pattern3.search(string):  # If the string matches pattern3
                results.add(string)      # Add to results

        return list(results)

    def search_msg(self, strs):
        results = set()
        for str in strs:
            for item in check_msg_list:
                if item in str:
                    results.add(item)
        return list(results)
                    
    def parse(self, filepath, parameters=[], functions=[]):
        strs = self.get_string(filepath)
        paras = self.search_parameter(parameters, strs)
        funcs = self.search_function(functions, strs)
        patterns = self.search_pattern(strs)
        msgs = self.search_msg(strs)
        return paras, funcs, patterns, msgs

    # Get the binary entry
    def search_entry(self, file_list):
        filepaths = []
        features = []
        results = []
        cluster_results = []

        msg_count = {}
        function_count = {}
        pattern_count = {}
        msg_norm = {}
        function_norm = {}
        pattern_norm = {}
        
        msg_MAX = 0
        msg_MIN = 9999
        msg_NORM_MAX = 0
        msg_NORM_MIN = 9999
        msg_MAX_SH = ""
        function_MAX = 0
        function_MIN = 9999
        function_NORM_MAX = 0
        function_NORM_MIN = 9999
        function_MAX_SH = ""
        pattern_MAX = 0
        pattern_MIN = 9999
        pattern_NORM_MAX = 0
        pattern_NORM_MIN = 9999
        pattern_MAX_SH = ""

        filename_pattern = re.compile(r"^(?=.*?(upd|check|update))(?=.*?(firmware|fw|sys)?).+$", re.I|re.M)

        for filepath in file_list:

            if not filepath.split("/")[-1]:
                filename = filepath.split("/")[-2]
            else:
                filename = filepath.split("/")[-1]
            if filepath in filepaths or filepath in results or ".so" in filepath or ".ko" in filepath or "device" in filepath:
                continue

            paras, funcs, patterns, msgs = self.parse(filepath)
            num_paras = len(paras)
            num_funcs = len(funcs)
            num_patterns = len(patterns)
            num_msgs = len(msgs)

            if len(filename_pattern.findall(filename))>0:
                self.ghidra_analysis(filepath)

                binaries_json_path = os.path.join(config.FW_RESULTS, "binaries.json")
                
                with open(binaries_json_path, "r") as f:
                    binaries_data = json.load(f)
                    binary_info = binaries_data.get(filepath)
                    all_strings = []
                    if binary_info:
                        if "para" in binary_info:
                            paras.extend(binary_info)
                        if "update" in binary_info:
                            msgs.extend(binary_info)
                        if "checksum" in binary_info:
                            msgs.extend(binary_info)
                        if "reboot" in binary_info:
                            msgs.extend(binary_info)

                        for key, value in binary_info.items():  
                            if isinstance(value, list):
                                all_strings.extend(value)
                            elif isinstance(value, dict):
                                for k, v in value.items():
                                    if isinstance(v, list):
                                        all_strings.extend(v)
                            elif isinstance(value, str) or isinstance(value, tuple):
                                all_strings.append(str(value))

                        patterns += self.search_pattern(all_strings)

                        num_paras += len(paras)
                        num_funcs += len(funcs)
                        num_patterns += len(patterns)            
                        num_msgs += len(msgs) 
                
                results.append(filepath)
                function_count[filepath] = num_paras+num_funcs
                pattern_count[filepath] = num_patterns+len(filename_pattern.findall(filename))   
                msg_count[filepath] = num_msgs
            if not results and num_patterns > 0:
                filepaths.append(filepath)
                features.append(0.3*num_paras+0.3*num_funcs+0.4*num_patterns) #num_patterns
                function_count[filepath] = num_paras+num_funcs
                pattern_count[filepath] = num_patterns   
                msg_count[filepath] = num_msgs   
                   

        if features and filepaths:
            features_sorted, cluster_results = zip(*sorted(zip(features, filepaths)))
            cluster_results = list(cluster_results)
            features_sorted = list(features_sorted)
        
        for count, (k, v) in enumerate(msg_count.items()):
            if count == 0:
                msg_MAX = v
                msg_MIN = v
            else:
                if v > msg_MAX:
                    msg_MAX = v
                elif v < msg_MIN:
                    msg_MIN = v
        for count, (k, v) in enumerate(function_count.items()):
            if count == 0:
                function_MAX = v
                function_MIN = v
            else:
                if v > function_MAX:
                    function_MAX = v
                elif v < function_MIN:
                    function_MIN = v

        for count, (k, v) in enumerate(pattern_count.items()):
            if count == 0:
                pattern_MAX = v
                pattern_MIN = v
            else:
                if v > pattern_MAX:
                    pattern_MAX = v
                elif v < pattern_MIN:
                    pattern_MIN = v

        for count, (k, v) in enumerate(msg_count.items()):
            if msg_MAX  == msg_MIN == 0:
                msg_NORM_MAX = 0
                break
            elif msg_MAX == msg_MIN != 0:
                msg_NORM_MAX = 0
                msg_MAX_SH = k
                continue
            norm = (v - msg_MIN) / (msg_MAX - msg_MIN)
            msg_norm[k] = norm
            if count == 0:
                if norm > msg_NORM_MAX:
                    msg_NORM_MAX = norm
                    msg_MAX_SH = k
                elif norm < msg_NORM_MIN:
                    msg_NORM_MIN = norm
            else:
                if norm > msg_NORM_MAX:
                    msg_NORM_MAX = norm
                    msg_MAX_SH = k
                elif norm < msg_NORM_MIN:
                    msg_NORM_MIN = norm

        for count, (k, v) in enumerate(function_count.items()):
            if function_MAX  == function_MIN == 0:
                function_NORM_MAX = 0
                break
            elif function_MAX == function_MIN != 0:
                function_NORM_MAX = 0
                function_MAX_SH = k
                continue
            norm = (v - function_MIN) / (function_MAX - function_MIN)
            function_norm[k] = norm
            if count == 0:
                if norm > function_NORM_MAX:
                    function_NORM_MAX = norm
                    function_MAX_SH = k
                elif norm < function_NORM_MIN:
                    function_NORM_MIN = norm
            else:
                if norm > function_NORM_MAX:
                    function_NORM_MAX = norm
                    function_MAX_SH = k
                elif norm < function_NORM_MIN:
                    function_NORM_MIN = norm
                    
        for count, (k, v) in enumerate(pattern_count.items()):
            if pattern_MAX  == pattern_MIN == 0:
                pattern_NORM_MAX = 0
                break
            elif pattern_MAX == pattern_MIN != 0:
                pattern_NORM_MAX = 0
                pattern_MAX_SH = k
                continue
            norm = (v - pattern_MIN) / (pattern_MAX - pattern_MIN)
            pattern_norm[k] = norm
            if count == 0:
                if norm > pattern_NORM_MAX:
                    pattern_NORM_MAX = norm
                    pattern_MAX_SH = k
                elif norm < pattern_NORM_MIN:
                    pattern_NORM_MIN = norm
            else:
                if norm > pattern_NORM_MAX:
                    pattern_NORM_MAX = norm
                    pattern_MAX_SH = k
                elif norm < pattern_NORM_MIN:
                    pattern_NORM_MIN = norm

        pattern123 = {}

        
        for k in pattern_norm:
            # If both function_norm and msg_norm are empty, use only pattern_norm
            if k in function_norm and k in msg_norm:
                # If all norms are available, include them in the calculation
                pattern123[k] = (0.2 * pattern_norm[k] +
                         0.3 * function_norm.get(k, 0) +
                         0.5 * msg_norm.get(k, 0))
            elif k in function_norm:
                # If function_norm is available but msg_norm is not, use function_norm and pattern_norm
                pattern123[k] = (0.2 * pattern_norm[k] +
                         0.3 * function_norm.get(k, 0))
            elif k in msg_norm:
                # If msg_norm is available but function_norm is not, use msg_norm and pattern_norm
                pattern123[k] = (0.2 * pattern_norm[k] +
                         0.5 * msg_norm.get(k, 0))
            else:
                # If only pattern_norm is available, use it alone
                pattern123[k] = pattern_norm[k] * 0.33

        maxPatternSH123 = max(pattern123, key=lambda x: float(pattern123[x]), default=None)
        maxPatternNorm123 = max(pattern123.values(), default=0)

        return maxPatternSH123, maxPatternNorm123
    
    # get the update handler binary
    def get_binhandler(self, file_list, parameters, functions, elfs):
        elf_dict = {}
        cluster_dict = {}
        filepaths = []
        features = []
        results = []
        cluster_results = []

        for elf in elfs:
            paras, funcs, patterns, msgs = self.parse(elf, parameters, functions)
            elf_dict[elf] = {'para': paras, 'func': funcs, 'pattern': patterns, 'msg': msgs} 

        filename_pattern = re.compile(r"^(?=.*?(firmware|fw))(?=.*?(upd|upg|ftp|check)).+$", re.I|re.M)
        for filepath in file_list:
            if filepath in elfs:
                continue
            filename = filepath.split("/")[-1]

            if filepath in filepaths or filepath in results or ".so" in filepath or ".ko" in filepath:
                continue

            webserver_words = ["httpd", "boa"]
            for server_type in webserver_words:
                if server_type in filepath:
                    results.append(filepath)

            paras, funcs, patterns, msgs = self.parse(filepath, parameters, functions)
            num_paras = len(paras)
            num_funcs = len(funcs)
            num_patterns = len(patterns)

            elf_dict[filepath] = {'para': paras, 'func': funcs, 'pattern': patterns, 'msg': msgs} 
            if parameters == set() and functions == set():
                if len(filename_pattern.findall(filename))>0:
                    results.append(filepath)
                if not results and num_patterns > 0:
                    filepaths.append(filepath)
                    features.append(num_patterns) 
            else:    
                if num_paras > 0 or num_funcs > 0:
                    filepaths.append(filepath)
                    features.append(0.3*num_paras+0.3*num_funcs+0.4*num_patterns)
        
        if features and filepaths:
            features_sorted, cluster_results = zip(*sorted(zip(features, filepaths)))
            cluster_results = [list(cluster_results)[0]]
            features_sorted = [list(features_sorted)[0]]

        final_results = set(cluster_results) | set(results) | set(elfs) 
        cluster_dict = {key:value for key, value in elf_dict.items() if key in final_results}
        return cluster_dict

    # use Ghidra for binary analysis
    def ghidra_analysis(self, filepath, keywords=[]):
        # define ghidra project path
        ghidra_project = os.path.join(config.FW_RESULTS, "ghidra_project")
        if not os.path.isdir(ghidra_project):
            os.makedirs(ghidra_project)
        
        binpath = filepath.strip('\n')
        binname = binpath.split('/')[-1]

        output_name = os.path.join(config.FW_RESULTS, "binaries.json")
        
        project_name = binname 
        ghidra_rep = os.path.join(ghidra_project, binname) + ".rep"
        ghidra_log = os.path.join(ghidra_project, binname) + ".log"

        ghidra_args = [
            config.HEADLESS_GHIDRA, ghidra_project, project_name,
            '-postscript', config.GHIDRA_SCRIPT, output_name, config.ROOT_PATH, config.FW_RESULTS, json.dumps(keywords),
            '-scriptPath', os.path.dirname(config.GHIDRA_SCRIPT)
        ]

        if os.path.exists(ghidra_rep):
            ghidra_args += ['-process', os.path.basename(binpath)]
        else:
            ghidra_args += ['-import', "'" + binpath + "'"]

        with open(ghidra_log, "w") as f:
            p = subprocess.Popen(ghidra_args, stdout=f, stderr=f)
            p.wait()
