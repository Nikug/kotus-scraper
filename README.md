# Kotus Scraper
A tool for scraping the whole Kotus Finnish dictionary

## Information
Kotimaisten kielten keskus (Kotus) maintains an extensive Finnish dictionary online.
This tool uses the old 2018 Kotus dictionary website to scrape that dictionary. Since they aggressively block bots with recaptcha, requests can be made approximately once every 10 seconds.
Thus, downloading the whole dictionary of 102169 words should take about 12 days. Luckily this process can be deployed to Heroku.

## Features
* Scrapes the words and their definitions
* Stores results into a database
* Stops on Recaptcha or any other issue
* Upon restart continues where it left off

## Technologies
* Node
* MongoDB