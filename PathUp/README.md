# PathUp
PathUp is an update path extracting module from (https://github.com/WUSTL-CSPL/ChkUp). PathUp can extract program execution paths from a firmware update procedure. To use PathUp, following lines should be followed to run the program from the command line, providing the file paths of unpacked firmware images. Three firmware images are given in the next directory.

## Dependencies
- python 3.6
- java 11.0.23
- npm 6.14.4
- python packages ([requirements.txt](./requirements.txt))

## Usage
1. Setup the testing environment;
2. Run PathUp using following line:
    ```
    python main.py --firmware_path "$file_path" --results_path "./results"
    ```
3. Check the output and the result folder for execution path results.

## Citation
@article{wu2024firmware,
  title={Your Firmware Has Arrived: A Study of Firmware Update Vulnerabilities},
  author={Wu, Yuhao and Wang, Jinwen and Wang, Yujie and Zhai, Shixuan and Li, Zihan and He, Yi and Sun, Kun and Li, Qi and Zhang, Ning},
  journal={USENIX Security Symposium},
  year={2024}
}
