 
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby1wxPaJNe9FWRV9_xg5kF2r0cDbT4ORhtYORVeIim4GBzlBXzXMzVvM56LG3sly9tx/exec'; 
        

    const DISPLAY_HEADERS = ['SR No', 'name', 'email', 'event', 'media', 'timestamp'];
    
    const POST_HEADERS = ['name', 'email', 'event', 'media']; 
        const dataTable = document.getElementById('dataTable');
        const tableBody = dataTable.querySelector('tbody');
        const tableHead = dataTable.querySelector('thead');
        const loadingDiv = document.getElementById('loading');
        const messageEl = document.getElementById('message');
        const addRowBtn = document.getElementById('addRowBtn');
        const printBtn = document.getElementById('printBtn');

        
        function showLoading(show) {
            loadingDiv.style.display = show ? 'flex' : 'none';
        }

        function showMessage(text, isError = false) {
            messageEl.textContent = text;
            messageEl.style.color = isError ? 'red' : 'green';
            setTimeout(() => messageEl.textContent = '', 4000);
        }

       
        function renderTable(data) {
         
            tableHead.innerHTML = `<tr>${DISPLAY_HEADERS.map(h => `<th>${h}</th>`).join('')}</tr>`;
            tableBody.innerHTML = ''; 

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="${DISPLAY_HEADERS.length}" style="text-align: center;">No data found.</td></tr>`;
                return;
            }

           
            data.forEach((record, index) => {
                const row = tableBody.insertRow();
                
                DISPLAY_HEADERS.forEach(header => {
                    const cell = row.insertCell();
                    let value = record[header] || '';

                    if (header === 'SR No') {
                        cell.textContent = index + 1; 
                    } else if (header === 'media' && value) {
                        const link = document.createElement('a');
                        link.href = value;
                        link.target = '_blank';
                        link.classList.add('media-link');
                        
                       
                        if (value.toLowerCase().match(/\.(jpe?g|png|gif)$/)) {
                            link.innerHTML = `<img src="${value}" alt="Media"/>`;
                        } else {
                             link.textContent = 'View File';
                        }
                        cell.appendChild(link);
                    } else {
                        
                        cell.textContent = value;
                    }
                });
            });
        }

        
        async function fetchData() {
            showLoading(true);
            try {
                const response = await fetch(`${SCRIPT_URL}?action=getRecords`); 
                const result = await response.json();
                
                if (result.data) {
                    renderTable(result.data);
                } else if (result.error) {
                    showMessage('Error fetching data: ' + result.error, true);
                } else {
                    showMessage('Error fetching data: Invalid response.', true);
                }
            } catch (e) {
                showMessage('Network error: Could not connect to the database.', true);
                console.error(e);
            } finally {
                showLoading(false);
            }
        }

        
        addRowBtn.addEventListener('click', function() {
           
            if (tableBody.querySelector('.new-record-row')) return;
            
            const newRow = tableBody.insertRow(0);
            newRow.classList.add('new-record-row');
            
            DISPLAY_HEADERS.forEach(header => {
                const cell = newRow.insertCell();

                if (header === 'SR No' || header === 'timestamp') {
                    cell.textContent = header === 'SR No' ? 'AUTO' : 'PENDING';
                } else if (header === 'media') {
                     
                     cell.textContent = '(N/A - File Upload)';
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = header;
                    input.dataset.header = header;
                    cell.appendChild(input);
                }
            });
            
            
            const actionCell = newRow.insertCell();
            actionCell.innerHTML = `
                <button class="btn btn-save" onclick="saveNewRecord(this)">Save</button>
                <button class="btn btn-cancel" onclick="cancelNewRecord(this)">Cancel</button>
            `;
        });
        
        function cancelNewRecord(button) {
            button.closest('tr').remove();
        }
        
      
        async function saveNewRecord(button) {
            showLoading(true);
            const row = button.closest('tr');
            const formData = new FormData();
            formData.append('action', 'add');

           
            row.querySelectorAll('input').forEach(input => {
                formData.append(input.dataset.header, input.value);
            });
            
           
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.result === 'success') {
                    showMessage('Record added successfully!');
                    await fetchData(); 
                } else {
                    showMessage('Error adding record: ' + (result.error || 'Server error'), true);
                }
            } catch (e) {
                showMessage('Network error during addition.', true);
            } finally {
                showLoading(false);
            }
        }


     
        printBtn.addEventListener('click', function() {
            
            window.print();
        });

    
        document.addEventListener('DOMContentLoaded', fetchData);
        