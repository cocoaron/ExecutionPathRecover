#!/usr/bin/python
# coding=utf-8

FW_NAME = "wa801nv1_en_3_12_6_up_bin_extracted"
RESULTS_DIR = "./results"
FW_RESULTS = "./results/wa801nv1_en_3_12_6_up_bin_extracted/exec_pth"
UFG_RESULTS = "./results/wa801nv1_en_3_12_6_up_bin_extracted/exec_pth"
ROOT_PATH = "/mnt/c/Users/연구실/projects/testing/firmware/extracted/wa801nv1_en_3_12_6_up_bin_extracted/100000/squashfs-root"
INPUT_PATH = "/mnt/c/Users/연구실/projects/testing/firmware/extracted/wa801nv1_en_3_12_6_up_bin_extracted"

HEADLESS_GHIDRA = "../ghidra_10.1.2_PUBLIC_20220125/ghidra_10.1.2_PUBLIC/support/analyzeHeadless" 
GHIDRA_SCRIPT = "./exec_pth_rec/ghidra_analysis.py" 
JSCFG_SCRIPT = "./exec_pth_rec/control_flows/js_cfg.js"
