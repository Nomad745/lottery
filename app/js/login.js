import { sendOtp, verifyOtp } from './auth.js';
import { getSession } from './database.js';

const phoneInput = document.getElementById('phone');
const otpInput = document.getElementById('otp');
const sendBtn = document.getElementById('btn-send');
const loginBtn = document.getElementById('btn-login');
const msgBox = document.getElementById('login-msg');

function showMsg(text) {
  msgBox.textContent = text;
  msgBox.style.display = 'flex';
}

async function ensureRedirectIfLogged() {
  const session = await getSession();
  if (session) {
    window.location.href = './index.html';
  }
}

sendBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    if (!phone) return showMsg('请填写手机号');
    await sendOtp(phone);
    showMsg('验证码已发送，请查收短信');
  } catch (e) {
    showMsg('发送失败：' + (e.message || e));
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    const phone = phoneInput.value.trim();
    const token = otpInput.value.trim();
    if (!phone || !token) return showMsg('请填写手机号与验证码');
    const session = await verifyOtp(phone, token);
    if (session) {
      showMsg('登录成功，正在跳转...');
      setTimeout(() => window.location.href = './index.html', 500);
    } else {
      showMsg('登录失败，请重试');
    }
  } catch (e) {
    showMsg('登录失败：' + (e.message || e));
  }
});

ensureRedirectIfLogged();
