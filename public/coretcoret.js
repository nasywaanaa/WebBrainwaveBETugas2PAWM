document.addEventListener('DOMContentLoaded', async function () {
    window.pyodide = await loadPyodide();
    console.log('Pyodide loaded successfully');
    
    const textarea = document.querySelector('#user_code');
    
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    loadQuestion(currentQuestion);
});

const questions = [
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },

    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    }
];


let userAnswers = new Array(questions.length).fill(null);

let currentQuestion = 1;


function loadQuestion(questionNumber) {
    const question = questions[questionNumber - 1];

    document.querySelector('.question_section .question_label').innerText = `Question ${questionNumber}`;
    document.querySelector('.question_section p').innerText = question.question;

    const inputElement = document.querySelector('.input_output_section .input_label').nextElementSibling;
    inputElement.innerHTML = ''; 
    question.input.forEach((input) => {
        inputElement.innerHTML += `<p>${input}</p>`;
    });

    document.querySelector('.input_output_section .output_label').nextElementSibling.innerText = question.output;

    document.getElementById("user_code").value = ''; 

    const buttons = document.querySelectorAll('.numbers_grid .number');
    buttons.forEach(btn => btn.classList.remove('active'));
    buttons[questionNumber - 1].classList.add('active');

    document.querySelector('.back_button').disabled = questionNumber === 1;


    const nextButton = document.querySelector('.next_button');
    if (questionNumber === questions.length) {
        nextButton.innerText = 'Submit';
        nextButton.onclick = submitQuiz;
    } else {
        nextButton.innerText = 'Next Question';
        nextButton.onclick = goToNextQuestion; 
    }
}

function goToNextQuestion() {
    if (currentQuestion < questions.length) {
        saveAnswer(currentQuestion); 
        currentQuestion++;
        loadQuestion(currentQuestion);
    }
}

function goToPreviousQuestion() {
    if (currentQuestion > 1) {
        saveAnswer(currentQuestion); 
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}

function saveAnswer(questionNumber) {
    const answer = document.getElementById("user_code").value; 
    userAnswers[questionNumber - 1] = answer; 
}

function submitQuiz() {
    let score = 0;

    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].output) {
            score += 100 / questions.length; 
        }
    }

    alert(`Your final score is: ${score}`);
}

document.querySelector('.check_button').addEventListener('click', function() {
    const answer = document.getElementById("user_code").value; 
    const activeQuestion = document.querySelector('.numbers_grid .number.active').innerText; 
    saveAnswer(activeQuestion, answer); 
});

async function runPythonCode() {
    console.log("Tombol Check ditekan!");

    var code = document.getElementById("user_code").value;
    console.log("Kode Python dari user:", code);

    try {
        let output = await pyodide.runPythonAsync(`
            import sys
            from io import StringIO

            output = StringIO()
            sys.stdout = output

            ${code}

            sys.stdout = sys.__stdout__  # Reset stdout
            output.getvalue()  # Return hasil output
        `);

        console.log("Output dari Python:", output);

        if (output.trim() !== "") {
            document.getElementById("output").innerHTML = "";
            checkAnswer(output);  
        } else {
            alert("Tidak ada output dari kode Anda. Coba lagi!");
        }

    } catch (err) {
        console.log("Error:", err);
        document.getElementById("output").innerHTML = err.toString();
    }
}

function checkAnswer(output) {
    var userOutput = output.trim();
    var correctAnswer = "3";  

    console.log("User Output:", userOutput);
    console.log("Expected Output:", correctAnswer);

    let case1Score = userOutput === correctAnswer ? 100 : 0;
    displayGrade(case1Score);
}

function displayGrade(finalScore) {
    const gradeBox = document.getElementById("grade_box");
    if (gradeBox) {
        gradeBox.style.display = "block"; 
    } else {
        console.error("Grade box element not found!");
    }

    const gradeElement = document.getElementById("grade");
    if (gradeElement) {
        gradeElement.innerText = finalScore.toFixed(2);
    }
}

function updateServerTime() {
    const timeElement = document.getElementById('server_time');
    const currentTime = new Date(); 

    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');

    timeElement.innerText = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateServerTime, 1000);

updateServerTime();
