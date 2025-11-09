const API_URL = './api/get_sales.php';

const ctx = document.getElementById('myChart');
    
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
        }]
    },
    options: {
        scales: {
        y: {
          beginAtZero: true
        }
      }
    }
});

const doughnut = document.getElementById('doughnut');

new Chart(doughnut,{
    type:'doughnut',
    data: {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
    datasets: [{
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
        ],
    hoverOffset: 4
  }]
}
})

fetch(API_URL)
.then(response=>{
    if (!response.ok) throw new Error("Error en la respuesta del servidor");
    return response.json();
})
.then(data=>{
    console.log("Clientes", data);
    
})
.catch(error => console.error("Error al obtener clientes", error));
