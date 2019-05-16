#!/bin/bash

echo "[pythonanywhere.com installing script]"

clone_repo() {
  echo "Cloning repository"
  git clone https://github.com/Zabqer/FractalUniverse.git
}

make_virtual_env() {
  if [ ! -d "./VirtualEnvironment" ]; then
    echo "Making virtual environment"
    python3 -m venv VirtualEnvironment
    source VirtualEnvironment/bin/activate
    pip install -r FractalUniverse/Backend/requirements.txt
    python3 FractalUniverse/Backend/manage.py migrate
    deactivate
  fi
}

set_wsgi_config() {
  wsgi_file="/var/www/${USER,,}_pythonanywhere_com_wsgi.py"
  echo "Setting WSGI file. Location: $wsgi_file"
  cat FractalUniverse/Backend/FractalUniverse/wsgi.py > $wsgi_file
}

cd ~

clone_repo
make_virtual_env
set_wsgi_config

echo "My job is done"
echo "You need to do:"
echo " - Open project settings"
echo " - Set venv path to $(realpath .)/VirtualEnvironment/"
echo " - Set src folder to $(realpath .)/FractalUniverse/Backend/"
