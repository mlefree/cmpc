@echo off

REM Windows script for running unit tests
REM You have to run server and capture some browser first
REM
REM Requirements:
REM - Java (http://www.java.com)

set BASE_DIR=%~dp0

java -jar "%BASE_DIR%\..\tests\lib\jstestdriver\JsTestDriver-1.3.5.jar" ^
     --config "%BASE_DIR%\..\tests\jsTestDriver.conf" ^
     --basePath "%BASE_DIR%\.." ^
     --tests all
