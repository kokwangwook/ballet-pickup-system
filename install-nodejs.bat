@echo off
echo Node.js 설치를 시작합니다...
echo 관리자 권한이 필요할 수 있습니다.
powershell -Command "Start-Process -Verb RunAs -FilePath 'node' -ArgumentList 'install-nodejs.js'"
pause