        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzFMpsZ2dx9PS2Daum6b5kx8uoLP8C1XTa4LB2Ioc6aFAMAoh3BqXMo99hVh6ij-jD/exec'; 
        const HEADERS = ['SR No', 'student', 'contact', 'email', 'college', 'payment', 'Actions'];

        const dataTable = document.getElementById('dataTable');
        const tableBody = dataTable.querySelector('tbody');
        const tableHead = dataTable.querySelector('thead');
        const loadingDiv = document.getElementById('loading');
        const messageEl = document.getElementById('message');
        const addRowBtn = document.getElementById('addRowBtn');
        const printBtn = document.getElementById('printBtn');
        const refreshDataBtn = document.getElementById('refreshDataBtn');
        
        function showLoading(show) {
          loadingDiv.style.display = show ? 'flex' : 'none';
        }

        function showMessage(text, isError = false) {
          messageEl.textContent = text;
          messageEl.style.color = isError ? 'red' : 'green';
          setTimeout(() => messageEl.textContent = '', 4000);
        }

        function renderTable(data) {
          tableHead.innerHTML = `<tr>${HEADERS.map(h => `<th>${h}</th>`).join('')}</tr>`;
          tableBody.innerHTML = ''; 

          if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${HEADERS.length}" style="text-align: center;">No data found.</td></tr>`;
            return;
          }

          data.forEach(record => {
            const row = tableBody.insertRow();
            row.dataset.sheetRow = record.sheetRow; 

            HEADERS.forEach(header => {
              const cell = row.insertCell();
              cell.dataset.header = header;
              
              if (header === 'Actions') {
                cell.innerHTML = `
                  <button class="btn btn-edit" onclick="editRecord(this)">Edit</button>
                  <button class="btn btn-save hidden" onclick="saveRecord(this)">Save</button>
                  <button class="btn btn-cancel hidden" onclick="cancelEdit(this)">Cancel</button>
                  <button class="btn btn-delete" onclick="deleteRecord(this)">Delete</button>
                `;
              } else {
                const value = record[header] || '';
                cell.textContent = value;

                if (header !== 'SR No') { 
                  const input = document.createElement('input');
                  input.type = 'text';
                  input.value = value;
                  input.classList.add('hidden');
                  input.dataset.header = header;
                  cell.appendChild(input);
                } else {
                   cell.dataset.srno = value;
                }
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
            } else {
              showMessage('Error fetching data: ' + result.error, true);
            }
          } catch (e) {
            showMessage('Network error: Could not connect to the Database.', true);
            console.error(e);
          } finally {
            showLoading(false);
          }
        }

        addRowBtn.addEventListener('click', function() {
          if (tableBody.querySelector('.new-record-row')) return;
          
          const newRow = tableBody.insertRow(0);
          newRow.classList.add('new-record-row');
          
          HEADERS.forEach(header => {
            const cell = newRow.insertCell();
            cell.dataset.header = header;

            if (header === 'SR No') {
              cell.textContent = 'AUTO';
            } else if (header === 'Actions') {
              cell.innerHTML = `
                <button class="btn btn-save" onclick="saveNewRecord(this)">Add</button>
                <button class="btn btn-cancel" onclick="cancelNewRecord(this)">Cancel</button>
              `;
            } else {
              const input = document.createElement('input');
              input.type = 'text';
              input.placeholder = header;
              input.dataset.header = header;
              cell.appendChild(input);
            }
          });
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
              showMessage('Record added successfully! Refreshing data...', false);
              
              await new Promise(resolve => setTimeout(resolve, 500)); 
              
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

        function editRecord(button) {
          const row = button.closest('tr');
          
          row.querySelector('.btn-edit').classList.add('hidden');
          row.querySelector('.btn-delete').classList.add('hidden');
          row.querySelector('.btn-save').classList.remove('hidden');
          row.querySelector('.btn-cancel').classList.remove('hidden');

          row.querySelectorAll('td').forEach(cell => {
            
            const textNode = Array.from(cell.childNodes).find(node => node.nodeType === 3);
            const input = cell.querySelector('input');
            
            if (input) {
              if (textNode) textNode.classList.add('hidden'); 
              input.classList.remove('hidden');
              if (textNode) input.value = textNode.textContent.trim();
            }
          });
        }

        function cancelEdit(button) {
             fetchData(); 
        }

        async function saveRecord(button) {
          showLoading(true);
          const row = button.closest('tr');
          const sheetRow = row.dataset.sheetRow;
          const formData = new FormData();
          formData.append('action', 'update');
          formData.append('sheetRow', sheetRow);
          
          const srNoCell = row.querySelector('[data-header="SR No"]');
          if (srNoCell) {
              formData.append('SR No', srNoCell.textContent);
          } 

          row.querySelectorAll('input:not(.hidden)').forEach(input => {
            formData.append(input.dataset.header, input.value);
          });
          
          try {
            const response = await fetch(SCRIPT_URL, {
              method: 'POST',
              body: formData
            });
            const result = await response.json();
            
            if (result.result === 'success') {
              showMessage('Record updated successfully!');
              await fetchData(); 
            } else {
              showMessage('Error updating record: ' + (result.error || 'Server error'), true);
            }
          } catch (e) {
            showMessage('Network error during update.', true);
          } finally {
            showLoading(false);
          }
        }

        async function deleteRecord(button) {
          if (!confirm('Are you sure you want to delete this record?')) return;
          
          showLoading(true);
          const row = button.closest('tr');
          const sheetRow = row.dataset.sheetRow;
          const formData = new FormData();
          formData.append('action', 'delete');
          formData.append('sheetRow', sheetRow);

          try {
            const response = await fetch(SCRIPT_URL, {
              method: 'POST',
              body: formData
            });
            const result = await response.json();
            
            if (result.result === 'success') {
              showMessage('Record deleted successfully!');
              await fetchData(); 
            } else {
              showMessage('Error deleting record: ' + result.error, true);
            }
          } catch (e) {
            showMessage('Network error during deletion.', true);
          } finally {
            showLoading(false);
          }
        }
        
        refreshDataBtn.addEventListener('click', fetchData);

        printBtn.addEventListener('click', function() {
            window.print();
        });

        document.addEventListener('DOMContentLoaded', fetchData);