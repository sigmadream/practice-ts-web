import * as net from 'net';

const HOST = '127.0.0.1';
const PORT = 12345;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`서버(${HOST}:${PORT})에 연결되었습니다.`);
    const message = 'Hello, Echo Server!';
    console.log('보냄:', message);
    client.write(message);
});

client.on('data', (data) => {
    console.log('받음:', data.toString());
    client.destroy();
});

client.on('close', () => {
    console.log('연결이 종료되었습니다.');
});

client.on('error', (err) => {
    console.error('에러 발생:', err.message);
});