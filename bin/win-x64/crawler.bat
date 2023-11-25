:: This file is part of the SiteOne Website Crawler.
::
:: (c) Ján Regeš <jan.reges@siteone.cz>

@echo off
SETLOCAL

SET "SCRIPT_DIR=%~dp0"

cd /d "%SCRIPT_DIR%"

bin\swoole-cli.exe "crawler.php" %*

SET "EXIT_CODE=%ERRORLEVEL%"

exit /b %EXIT_CODE%
