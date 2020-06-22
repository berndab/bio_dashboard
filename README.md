# [Bio Dashboard](https://berndab.github.io/bio_dashboard/)

## Purpose

The purpose of this project is to create a dashboard to display data from a research project that collected bacteria samples from research participants' bodies and generating distribution statistics on the different bacteria species found in each participant's bacteria sample. The dashboard webpage allows users to analyze this data. 

The user selects a research participant id on the dashboard. Then the dashboard reads the data file, displays metadata on the participant, and presents various visualization of that display data on the distribution of bacteria species found in the patient’s body sample. 

## Technical Description

This bacteria research data is contained in a JSON file. A dashboard webpage reads this data file when a research participant’s' id is selected, displays the participant’s metadata, displays a bar chart the top 10 most prevalent bacteria species found in the participants body sample, displays a gauge chart based on the participant's washing frequency, and displays a bubble chart displaying all the bacteria species distribution data for the species found in the participants body sample.

## Technology
This project used the Plotly.js API to display the various visualizations on the dashboard and used Bootstrap CSS framework to structure the HTML used to create the dashboard webpage. 

