document.addEventListener('DOMContentLoaded', function() {
    var ctx = document.getElementById('tasksChart').getContext('2d');

    var tasksChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Correct Answer', 'Wrong Answer', 'Not Answered'],
            datasets: [{
                data: [87, 12, 4], 
                backgroundColor: ['#5B2245', '#AA5D71', '#C0A5A6'], 
                hoverOffset: 4 
            }]
        },
        options: {
            responsive: true, 
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ' : ' + tooltipItem.raw; 
                        }
                    }
                }
            },
            cutout: '70%',
            radius: '90%',
            elements: {
                arc: {
                    borderWidth: 2, 
                    borderColor: '#f5f5f5' 
                }
            }
        }
    });
});
