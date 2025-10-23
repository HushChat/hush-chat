docker-compose up > docker-compose.out &


#!/bin/bash
while ((1)) ; do
    DOCKER_LOG_LAST_LINE=$(cat docker-compose.out | tail -1) 
    # if [ "$DOCKER_LOG_LAST_LINE" != "" ];then
    #     ## echo $DOCKER_LOG_LAST_LINE
    # fi
    db_success_string="database system is ready to accept connections"
    if [[ $DOCKER_LOG_LAST_LINE == *$db_success_string* ]]; then
        cat docker-compose.out
        echo  "###########=====DB has been initialized=====##########"

        mvn spring-boot:run  #-Dspring-boot.run.arguments=--logging.level.org.springframework=DEBUG
        break
    fi
    sleep 1
done
# 