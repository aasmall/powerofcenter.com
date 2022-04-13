#!/bin/bash
hugo
gsutil -m rsync -R public gs://power-of-center-website-content