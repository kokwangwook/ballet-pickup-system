const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

// Node.js LTS 버전 다운로드 URL
const NODE_VERSION = '20.11.1';
const NODE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-x64.msi`;

// 다운로드 디렉토리 설정
const downloadDir = path.join(os.tmpdir(), 'nodejs-installer');
const installerPath = path.join(downloadDir, 'nodejs-installer.msi');

// 디렉토리 생성
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

console.log('Node.js 설치 프로그램 다운로드 중...');

// 설치 프로그램 다운로드
https.get(NODE_URL, (response) => {
    const fileStream = fs.createWriteStream(installerPath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
        fileStream.close();
        console.log('다운로드 완료! 설치를 시작합니다...');

        // MSI 설치 프로그램 실행
        exec(`Set-ExecutionPolicy RemoteSigned; msiexec /i "${installerPath}" /quiet /norestart`, (error, stdout, stderr) => {
            if (error) {
                console.error('설치 중 오류 발생:', error);
                return;
            }
            console.log('Node.js 설치가 완료되었습니다!');
            
            // 설치 프로그램 삭제
            fs.unlink(installerPath, (err) => {
                if (err) {
                    console.error('설치 프로그램 삭제 중 오류:', err);
                } else {
                    console.log('설치 프로그램이 삭제되었습니다.');
                }
            });
        });
    });
}).on('error', (err) => {
    console.error('다운로드 중 오류 발생:', err);
}); 