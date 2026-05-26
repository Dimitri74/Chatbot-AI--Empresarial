@REM Maven Wrapper script for Windows
@REM Licensed to the Apache Software Foundation (ASF) under one or more
@REM contributor license agreements.

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_SAVE_ERRORLEVEL__=
@SET __MVNW_SAVE_JAVA_HOME__=

@SET MAVEN_PROJECTBASEDIR=%~dp0
@IF NOT "%MAVEN_BASEDIR%"=="" SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%

@SET MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties

@IF EXIST "%MAVEN_WRAPPER_JAR%" GOTO runWithWrapper

@WHERE mvn >NUL 2>&1
@IF %ERRORLEVEL% EQU 0 (
  mvn %*
  GOTO end
)

@ECHO Maven not found. Please install Maven.
@EXIT /B 1

:runWithWrapper
@"%JAVA_HOME%\bin\java.exe" ^
  -classpath "%MAVEN_WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

:end
@SET ERRORLEVEL=%__MVNW_SAVE_ERRORLEVEL__%