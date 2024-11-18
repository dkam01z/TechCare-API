$(document).ready(function () {
    const patientsList = $('#patients-list');
    let bloodPressureChart = null;

    const credentials = btoa('coalition:skills-test');

    fetch('https://fedskillstest.coalitiontechnologies.workers.dev/', {
        headers: {
            'Authorization': 'Basic ' + credentials
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        renderPatientList(data);
    })
    .catch(error => {
        console.error('Error fetching patient data:', error);
    });

    function renderPatientList(patients) {
        patients.forEach(patient => {
            const patientItem = `
                <div class="patient-item" tabindex="0">
                    <div class="patient-details">
                        <p class="patient-name">${patient.name}</p>
                        <p class="patient-age-gender">${patient.gender}, ${patient.age}</p>
                    </div>
                    <span class="more-options">...</span>
                </div>
            `;
            patientsList.append(patientItem);
        });

        $('.patient-item').on('click', function () {
            const patientName = $(this).find('.patient-name').text();
            const selectedPatient = patients.find(p => p.name === patientName);

            $('.patient-item').removeClass('active');
            $(this).addClass('active');

            renderPatientDetails(selectedPatient);
        });
    }

    function renderPatientDetails(patient) {
        const months = patient.diagnosis_history.map(entry => `${entry.month}, ${entry.year}`);
        const systolicValues = patient.diagnosis_history.map(entry => entry.blood_pressure.systolic.value);
        const diastolicValues = patient.diagnosis_history.map(entry => entry.blood_pressure.diastolic.value);
    
        $('#patient-name').text(patient.name);
        $('#dob').text(patient.date_of_birth);
        $('#gender').text(patient.gender);
        $('#contact-info').text(patient.phone_number);
        $('#emergency-contacts').text(patient.emergency_contact);
        $('#insurance-provider').text(patient.insurance_type);
        $('.profile-img').attr('src', patient.profile_picture);
    
        const latestDiagnosis = patient.diagnosis_history[0];
        $('.rep-rate').text(`${latestDiagnosis.respiratory_rate.value} bpm`);
        $('.respiratory-status').text(latestDiagnosis.respiratory_rate.levels);
    
        $('.temp-rate').text(`${latestDiagnosis.temperature.value}°F`);
        $('.temperature-status').text(latestDiagnosis.temperature.levels);
    
        $('.h-rate').text(`${latestDiagnosis.heart_rate.value} bpm`);
        $('.heart-rate-status').text(latestDiagnosis.heart_rate.levels);
    
        $('#systolic-value').text(latestDiagnosis.blood_pressure.systolic.value);
        $('#systolic-level').text(latestDiagnosis.blood_pressure.systolic.levels);
        
        $('#diastolic-value').text(latestDiagnosis.blood_pressure.diastolic.value);
        $('#diastolic-level').text(latestDiagnosis.blood_pressure.diastolic.levels);
    
        updateBloodPressureChart(months, systolicValues, diastolicValues);
    
        renderDiagnosticList(patient.diagnostic_list);
        renderLabResults(patient.lab_results); 
    }
    

    function renderDiagnosticList(diagnosticList) {
        const diagnosticBody = $('#diagnostic-list-body');
        diagnosticBody.empty();

        diagnosticList.forEach(diagnosis => {
            const row = `
                <tr>
                    <td>${diagnosis.name}</td>
                    <td>${diagnosis.description}</td>
                    <td>${diagnosis.status}</td>
                </tr>
            `;
            diagnosticBody.append(row);
        });
    }

    function renderLabResults(labResults) {
        const labResultsContainer = $('.lab-results ul'); 
        labResultsContainer.empty(); 
    
        labResults.forEach(result => {
            const labItem = `
                <li>
                    <span>${result}</span>
                    <a href="#"><i class="download-icon">⬇</i></a>
                </li>
            `;
            labResultsContainer.append(labItem);
        });
    }
    

    function updateBloodPressureChart(months, systolicValues, diastolicValues) {
        if (bloodPressureChart) {
            bloodPressureChart.destroy();
        }

        const ctx = document.getElementById('bloodPressureChart').getContext('2d');
        bloodPressureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Systolic',
                        data: systolicValues,
                        borderColor: '#E800F0',
                        backgroundColor: 'rgba(232, 0, 240, 0.1)',
                        tension: 0.4,
                    },
                    {
                        label: 'Diastolic',
                        data: diastolicValues,
                        borderColor: '#8C83E2',
                        backgroundColor: 'rgba(140, 131, 226, 0.1)',
                        tension: 0.4,
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    y: {
                        suggestedMin: 60,
                        suggestedMax: 180,
                        ticks: {
                            stepSize: 20,
                        },
                        grid: {
                            drawBorder: false,
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: '#800080',
                        titleColor: '#000',
                        bodyColor: '#000',
                        displayColors: false,
                    }
                }
            }
        });
    }
});
