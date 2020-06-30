#!/bin/bash
hugo
gsutil rsync -R public gs://power_of_center_com_website