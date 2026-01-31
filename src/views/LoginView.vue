<template>
	<div class="login">
		<h1>漫画・アニメ管理アプリ</h1>
		<h2>ログイン</h2>

		<!-- ウェルカムメッセージ -->
		<p class="welcome">
		漫画・アニメ管理アプリへようこそ<br>
		ここでは漫画・アニメの管理を自分好みに設定することができます
		</p>

		<!-- ユーザーID表示 -->
		<p>ユーザーID: {{ userId }}</p>

		<!-- パスワード入力欄 -->
		<input
			type="password"
			v-model="password"
			placeholder="パスワードを入力してください"
		/>

		<!-- ログインボタン -->
		<button @click="login">ログイン</button>

		<!-- エラーメッセージ -->
		<p v-if="errorMessage" class="error">{{ errorMessage }}</p>

		<!-- パスワード再登録案内 -->
		<p class="forgot">パスワードを忘れた場合はこちらから再登録してください</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

//ユーザー情報
const userId = '123'
const correctPassword = 'pass123'

const password = ref('')
const errorMessage = ref('')
const showResetGuide = ref(false)

function login() {
  if (password.value === correctPassword) {
    errorMessage.value = ''
    showResetGuide.value = false
    router.push('/home') // ログイン成功でホームへ遷移
  } else {
    errorMessage.value = 'パスワードが違います'
    showResetGuide.value = true
  }
}
</script>

<style scoped>
.login {
	max-width: 600px;
	margin: 50px auto;
	padding: 20px;
	text-align: center;
}
.login h1 {
	font-size: 50px; 
	font-weight: bold;
	margin-bottom: 10px;
	white-space: nowrap;
}
.login h2 {
	font-size: 30px;   
	margin-bottom: 60px;
}
input {
	display: block;
	margin: 10px auto;
	padding: 8px;
	font-size: 16px;
	width: 80%;
}
button {
	margin-top: 10px;
	padding: 8px 16px;
	background-color: #4CAF50;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}
button:hover {
	background-color: #45a049;
}
.welcome {
	margin: 40px 0;
	font-size: 20px;
	line-height: 1.6;
	color: #333;
}
.error {
	color: red;
	margin-top: 10px;
}
.reset-guide {
	color: blue;
	margin-top: 10px;
}
.forgot {
	margin-top: 20px;
	font-size: 0.9em;
	color: gray;
}

/* スマホ用レイアウト調整（折り返しなしで収める） */
@media (max-width: 600px) {
  .login h1 {
    font-size: 28px;   /* ← スマホ向けに小さくする */
    white-space: nowrap; /* ← 折り返し禁止のまま */
  }

  .login h2 {
    font-size: 20px;
  }

  .login {
    margin: 20px auto;
    padding: 10px;
  }
}
</style>
