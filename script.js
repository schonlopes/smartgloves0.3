var ws;
var statusElement = document.getElementById("status");
var messageElement = document.getElementById("message");
var voiceSelect = document.getElementById("voice");
var toggleSoundButton = document.getElementById("toggle-sound");
var soundEnabled = false;
var activeMessages = [];
var lastMessageTime = 0; // Inicializa o tempo da última mensagem como 0

// Define o status inicial como "Desconectado"
statusElement.innerText = "Desconectado";
statusElement.classList.add("disconnected");

// Função para abrir a conexão WebSocket
function connectWebSocket() {
  ws = new WebSocket("ws://192.168.0.200:81/");

  // Quando a conexão for estabelecida
  ws.onopen = function() {
    statusElement.innerText = "Conectado";
    statusElement.classList.remove("disconnected");
    statusElement.classList.add("connected");
    lastMessageTime = Date.now(); // Atualiza o tempo da última mensagem
  };

  // Quando a conexão for encerrada
  ws.onclose = function() {
    statusElement.innerText = "Desconectado";
    statusElement.classList.remove("connected");
    statusElement.classList.add("disconnected");

    // Tentar reconectar após 5 segundos
    setTimeout(connectWebSocket, 5000);
  };

  // Quando receber dados do servidor
  ws.onmessage = function(event) {
    lastMessageTime = Date.now(); // Atualiza o tempo da última mensagem
    var sensorValues = event.data.split(",");

    // Convertendo os valores para graus e atualizando o texto na tela
    var sensor1Degrees = convertToDegrees(parseInt(sensorValues[0]));
    var sensor2Degrees = convertToDegrees(parseInt(sensorValues[1]));
    var sensor3Degrees = convertToDegrees(parseInt(sensorValues[2]));
    var sensor4Degrees = convertToDegrees(parseInt(sensorValues[3]));
    var sensor5Degrees = convertToDegrees(parseInt(sensorValues[4]));

    document.getElementById("sensor1").innerText = "Sensor 1: " + sensor1Degrees + "°";
    document.getElementById("sensor2").innerText = "Sensor 2: " + sensor2Degrees + "°";
    document.getElementById("sensor3").innerText = "Sensor 3: " + sensor3Degrees + "°";
    document.getElementById("sensor4").innerText = "Sensor 4: " + sensor4Degrees + "°";
    document.getElementById("sensor5").innerText = "Sensor 5: " + sensor5Degrees + "°";

    // Exibe mensagens baseadas nos valores dos sensores
    if (parseInt(sensorValues[0]) < 400) showMessage("1", "Estou com SEDE");
    if (parseInt(sensorValues[1]) < 400) showMessage("2", "Estou com FOME");
    if (parseInt(sensorValues[2]) < 400) showMessage("3", "Preciso ir ao BANHEIRO");
    if (parseInt(sensorValues[3]) < 400) showMessage("4", "Sinto DOR");
    if (parseInt(sensorValues[4]) < 400) showMessage("5", "EU TE AMO");
  };

  // Se houver erro
  ws.onerror = function(error) {
    console.log("Erro de WebSocket: ", error);
  };
}

// Função para verificar se o WebSocket está recebendo dados
function checkWebSocketConnection() {
  var currentTime = Date.now();
  // Verifica se passou mais de 5 segundos desde a última mensagem
  if (lastMessageTime === 0 || currentTime - lastMessageTime > 5000) {
    statusElement.innerText = "Desconectado";
    statusElement.classList.remove("connected");
    statusElement.classList.add("disconnected");
  }
}

// Verificação contínua do estado da conexão WebSocket
setInterval(checkWebSocketConnection, 2000);

// Função para tocar som correspondente
function playSound(sensor) {
  if (soundEnabled) {
    var selectedVoice = voiceSelect.value;
    var soundPath = `Sons/${selectedVoice}/${sensor}.mp3`;
    var audio = new Audio(soundPath);
    audio.play();
  }
}

// Função para mostrar mensagens de alerta
function showMessage(sensor, text) {
  if (!activeMessages.includes(sensor)) {
    activeMessages.push(sensor);
    messageElement.innerText = text;
    messageElement.classList.add("alert");
    playSound(sensor);

    setTimeout(function() {
      messageElement.innerText = '';
      messageElement.classList.remove("alert");
      activeMessages = activeMessages.filter(function(item) { return item !== sensor; });
    }, 10000); // Exibe a mensagem por 10 segundos
  }
}

// Lógica do botão para ativar/desativar som
toggleSoundButton.addEventListener("click", function() {
  soundEnabled = !soundEnabled;
  toggleSoundButton.innerText = soundEnabled ? "Desativar Som" : "Ativar Som";
});

// Função para converter o valor do sensor em graus
function convertToDegrees(sensorValue) {
  if (sensorValue >= 490) return 0;
  else if (sensorValue <= 230) return 180;
  var degrees = (1 - (sensorValue - 230) / (490 - 230)) * 180;
  return Math.round(degrees);
}

// Inicializa a conexão WebSocket
connectWebSocket();
