document.addEventListener('DOMContentLoaded', async function () {
    window.pyodide = await loadPyodide();
    console.log('Pyodide loaded successfully');
    
    const textarea = document.querySelector('#user_code');
    
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// Function to fetch data from the backend
function fetchData() {
    fetch('http://localhost:8080/api/data')
      .then(response => response.json())
      .then(data => {
        // Handle the response data here
        console.log(data); // Should print { message: 'Hello from the backend!' }
  
        // Display data in the HTML, e.g., in a div with id="output"
        document.getElementById('output').innerText = data.message;
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  
  // Call fetchData when the page loads or a button is clicked
  document.addEventListener('DOMContentLoaded', fetchData);  

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
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
    {
        question: "Buatlah sebuah program yang menerima tiga masukan: angka pertama, operator aritmatika, dan angka kedua...",
        input: ["1"],
        output: "3"
    },
];


let userAnswers = new Array(questions.length).fill(null);
let userGrades = new Array(questions.length).fill(null);

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
        currentQuestion++;
        loadQuestion(currentQuestion);
    }
}


function goToPreviousQuestion() {
    if (currentQuestion > 1) {
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    loadQuestion(currentQuestion);
});



function navigateToQuestion(questionNumber) {
    loadQuestion(questionNumber);
}

function saveAnswer(questionNumber) {
    const answer = document.getElementById("user_code").value.trim(); 
    if (answer !== "") {  
        userAnswers[questionNumber - 1] = answer;
    }
}

function submitQuiz() {
    let score = 0;
    let unansweredQuestions = 0;

    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === null || userAnswers[i] === "") {
            unansweredQuestions++; 
        } else {
            score += questionGrades[i];
        }
    }

    if (unansweredQuestions > 0) {
        alert(`You have ${unansweredQuestions} unanswered question(s). Please answer all questions before submitting.`);
    } else {
        alert(`Your final score is: ${score}`);
    }
}

document.querySelector('.check_button').addEventListener('click', function() {
    const answer = document.getElementById("user_code").value; 
    const activeQuestion = Number(document.querySelector('.numbers_grid .number.active').innerText); // Get the active question number and convert to number
    saveAnswer(activeQuestion); 

});

document.querySelector('.submit_button').addEventListener('click', submitQuiz);

async function runPythonCode() {
    console.log("Tombol Check ditekan!");


    var code = document.getElementById("user_code").value;
    console.log("Kode Python dari user:", code);

    try {

        let pyodide = await loadPyodide();
        console.log("Pyodide berhasil di-load");  


        let output = await pyodide.runPythonAsync(`
            import sys
            from io import StringIO

            output = StringIO()
            sys.stdout = output

            # Eksekusi kode Python user
            ${code}

            sys.stdout = sys.__stdout__  # Reset stdout
            output.getvalue()  # Return hasil output
        `);

        console.log("Output dari Python:", output);

        if (output.trim() !== "") {
            document.getElementById("output").innerHTML = "";
            const activeQuestion = currentQuestion; 
            checkAnswer(output, activeQuestion);  
        } else {
            alert("Tidak ada output dari kode Anda. Coba lagi!");
        }

    } catch (err) {
        console.log("Error:", err);
        document.getElementById("output").innerHTML = err.toString();
    }
}



function checkAnswer(output, questionNumber) {
    var userOutput = output.trim();
    var correctAnswer = questions[questionNumber - 1].output;

    console.log("User Output:", userOutput);
    console.log("Expected Output:", correctAnswer);


    let case1Score, case2Score, case3Score;


    if (userOutput === correctAnswer) {
        case1Score = 100;
    } else {
        case1Score = 0; 
    }


    if (userOutput === correctAnswer) {
        case2Score = 100;
    } else {
        case2Score = 0; 
    }


    if (userOutput === correctAnswer) {
        case3Score = 100; 
    } else {
        case3Score = 0; 
    }


    let finalGrade = (case1Score + case2Score + case3Score) / 3;
    userGrades[questionNumber - 1] = finalGrade; 
    displayGrade(finalGrade, case1Score, case2Score, case3Score);
}



function displayGrade(finalScore, case1Score, case2Score, case3Score) {
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

    const case1Element = document.getElementById("case1");
    if (case1Element) {
        case1Element.innerText = case1Score;
    }

    const case2Element = document.getElementById("case2");
    if (case2Element) {
        case2Element.innerText = case2Score;
    }

    const case3Element = document.getElementById("case3");
    if (case3Element) {
        case3Element.innerText = case3Score;
    }

    const questionNumberElement = document.querySelector('.numbers_grid .number.active');

    if (questionNumberElement) {
        questionNumberElement.classList.remove('green', 'orange', 'red');
        if (finalScore === 100) {
            questionNumberElement.classList.add('green'); 
        } else if (finalScore > 0 && finalScore < 100) {
            questionNumberElement.classList.add('orange');
        } else if (finalScore === 0) {
            questionNumberElement.classList.add('red'); 
        }
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
