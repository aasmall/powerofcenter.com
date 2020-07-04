#!/bin/bash
hugo
gsutil -m rsync -R public gs://power_of_center_com_website