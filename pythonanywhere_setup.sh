#!/bin/bash

echo "[pythonanywhere.com installing script]"

make_virtual_env() {
  echo "Making virtual environment"
  python3 -m venv VirtualEnvironment
  source VirtualEnvironment/bin/activate
  pip install -r requirements.txt
  deactivate
}

clone_repo() {
  echo "Cloning repository"
  git clone https://github.com/Zabqer/FractalUniverse.git
}

set_wsgi_config() {
  wsgi_file="/var/www/${USER,,}_pythonanywhere_com_wsgi.py"
  echo "Setting WSGI file. Location: $wsgi_file"
  cat Backend/FractalUniverse/FractalUniverse/wsgi.py > $wsgi_file
}

make_virtual_env
clone_repo
set_wsgi_config

echo "My job is done"
echo "You need to do:"
echo " - Open project settings"
echo " - Set venv path to $(realpath .)/VirtualEnvironment/"
echo " - Set src folder to $(realpath .)/Backend/"
