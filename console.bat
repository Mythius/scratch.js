@echo off
:start
set /p "cmd=>"
@echo on
%cmd%
@echo off
goto start