@echo off

PUSHD ..
docker-compose  --file docker-compose-project.yml --env-file .env_prod  up -d 
POPD

   

