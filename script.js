
        const SPREADSHEET_ID = '12wNW3Erjr5sgYz1CpWcc907f1AW7kyoHN8zhiyPPUUw';
        const API_KEY = 'AIzaSyBhiKDVDH4fle5_EqAIaA05YjpxVMEBYZM';
        const SHEET_NAME = 'EBIFRY';
        
        let allData = [];
        let filteredData = [];
        let brandChart = null;
        let stockChart = null;
        let trendChart = null;
        let topBrandChart = null;
        let currentSort = { field: 'brand', order: 'asc' };

        async function loadData() {
            try {
                document.getElementById('loadingState').classList.remove('hidden');
                document.getElementById('errorState').classList.add('hidden');
                document.getElementById('tableContainer').classList.add('hidden');
                
                // Get sheet data
                const sheetResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
                );
                
                if (!sheetResponse.ok) {
                    throw new Error('Failed to fetch data');
                }
                
                const sheetData = await sheetResponse.json();
                const rows = sheetData.values || [];
                
                if (rows.length === 0) {
                    throw new Error('No data found');
                }

                // Get file modification time from Drive API
                let lastModified = new Date().toLocaleString('id-ID');
                try {
                    const driveResponse = await fetch(
                        `https://www.googleapis.com/drive/v3/files/${SPREADSHEET_ID}?fields=modifiedTime&key=${API_KEY}`
                    );
                    if (driveResponse.ok) {
                        const driveData = await driveResponse.json();
                        lastModified = new Date(driveData.modifiedTime).toLocaleString('id-ID');
                    }
                } catch (driveError) {
                    console.warn('Could not fetch drive modification time:', driveError);
                }
                
                // Process data (skip header row)
                allData = rows.slice(1).map((row, index) => ({
                    id: index,
                    namaDetailMc: row[0] || '',
                    namaFileExcel: row[1] || '',
                    brandSize: row[2] || '',
                    brand: row[3] || '',
                    order: row[4] || '',
                    assortment: row[5] || '',
                    etd1: row[6] || '',
                    shipmentPlan: row[7] || '',
                    etd2: row[8] || '',
                    stock: parseInt(row[9]) || 0,
                    lama: row[10] || '',
                    pr: row[11] || '',
                    polos: row[12] || '',
                    karantina: row[13] || '',
                    estimasi: row[14] || '',
                    total: parseInt(row[15]) || 0
                }));
                
                filteredData = [...allData];
                updateStats();
                updateFilters();
                renderTable();
                showNotification('Data berhasil dimuat!', 'success');
                
                document.getElementById('loadingState').classList.add('hidden');
                document.getElementById('tableContainer').classList.remove('hidden');
                document.getElementById('lastUpdate').textContent = `Di Update : ${lastModified}`;
                
            } catch (error) {
                console.error('Error loading data:', error);
                document.getElementById('loadingState').classList.add('hidden');
                document.getElementById('errorState').classList.remove('hidden');
            }
        }

        function updateStats() {
            const totalItems = allData.length;
            const totalStock = allData.reduce((sum, item) => sum + item.stock, 0);
            
            
            const brands = new Set(allData.map(item => item.brand).filter(brand => brand)).size;
            
            document.getElementById('totalItems').textContent = totalItems.toLocaleString('id-ID');
            document.getElementById('totalStock').textContent = totalStock.toLocaleString('id-ID');
            
            
            document.getElementById('totalBrands').textContent = brands.toLocaleString('id-ID');
        }

        function updateFilters() {
            const brandFilter = document.getElementById('brandFilter');
            const brands = [...new Set(allData.map(item => item.brand).filter(brand => brand))].sort();
            
            brandFilter.innerHTML = '<option value="">Semua Brand</option>';
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandFilter.appendChild(option);
            });
        }

        
        

        function showNotification(message, type = 'info') {
            const container = document.getElementById('notificationContainer');
            const notification = document.createElement('div');
            
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };
            
            notification.className = `notification ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg`;
            notification.innerHTML = `
                <div class="flex items-center justify-between">
                    <span>${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">✕</button>
                </div>
            `;
            
            container.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        
        
        

        function showTableModal() {
            document.getElementById('tableModal').classList.remove('hidden');
            renderFullTable();
        }

        function hideTableModal() {
            document.getElementById('tableModal').classList.add('hidden');
        }

        function showDetailModal(id) {
            const item = allData.find(item => item.id === id);
            if (!item) return;

            
                 const detailContent = document.getElementById('detailContent');
            detailContent.innerHTML = `
                <!-- Header Section -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${item.brand || 'N/A'}</h3>
                            <p class="text-gray-600">${item.namaDetailMc || 'N/A'}</p>
                        </div>
                        
                        
                    </div>
                </div>

                <!-- Complete Data Grid -->
                <div class="space-y-6">
                    <!-- Row 1: Basic Information -->
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Detail MC</label>
                            <p class="text-sm text-gray-900 font-medium">${item.namaDetailMc || '-'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">File Excel</label>
                            <p class="text-sm text-gray-900">${item.namaFileExcel || '-'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Brand Size</label>
                            <p class="text-sm text-gray-900 font-medium">${item.brandSize || '-'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Brand</label>
                            <p class="text-sm text-gray-900 font-bold text-blue-600">${item.brand || '-'}</p>
                        </div>
                    </div>

                    <!-- Row 2: Order & Assortment -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Order</label>
                            <p class="text-sm text-gray-900">${item.order || '-'}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Assortment</label>
                            <p class="text-sm text-gray-900">${item.assortment || '-'}</p>
                        </div>
                    </div>

                    <!-- Row 3: Timeline Information -->
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <span class="mr-2">📅</span> Timeline & Shipping
                        </h4>
                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">ETD 1</label>
                                <p class="text-sm text-gray-900 font-medium">${item.etd1 || '-'}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Shipment Plan</label>
                                <p class="text-sm text-gray-900">${item.shipmentPlan || '-'}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">ETD 2</label>
                                <p class="text-sm text-gray-900 font-medium text-green-600">${item.etd2 || '-'}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Estimasi</label>
                                <p class="text-sm text-gray-900">${item.estimasi || '-'}</p>
                            </div>
                        </div>
                    </div>

               <!-- Row 4: Stock Information -->
                    <div class="bg-green-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <span class="mr-2">📊</span> Stock 
                        </h4>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div class="text-center">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Current Stock</label>
                                <p class="text-3xl font-bold text-blue-600">${item.stock.toLocaleString('id-ID')}</p>
                            </div>
                            <div class="text-center">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Total</label>
                                <p class="text-3xl font-bold text-green-600">${item.total.toLocaleString('id-ID')}</p>
                            </div>
                            <div class="text-center">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Lama</label>
                                <p class="text-lg text-gray-900">${item.lama || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Row 5: Process Status -->
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <h4 class="font-semibold text-gray-800 mb-4 flex items-center">
                            <span class="mr-2">⚙️</span> Process Status
                        </h4>
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div class="text-center p-4 bg-white rounded-lg border-2 ${item.pr ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">PR Status</label>
                                <p class="text-lg font-bold ${item.pr ? 'text-green-600' : 'text-gray-400'}">${item.pr || 'Belum Ada'}</p>
                            </div>
                            <div class="text-center p-4 bg-white rounded-lg border-2 ${item.polos ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Polos Status</label>
                                <p class="text-lg font-bold ${item.polos ? 'text-green-600' : 'text-gray-400'}">${item.polos || 'Belum Ada'}</p>
                            </div>
                            <div class="text-center p-4 bg-white rounded-lg border-2 ${item.karantina ? 'border-green-200 bg-green-50' : 'border-gray-200'}">
                                <label class="block text-xs font-medium text-gray-500 uppercase mb-2">Karantina Status</label>
                                <p class="text-lg font-bold ${item.karantina ? 'text-green-600' : 'text-gray-400'}">${item.karantina || 'Belum Ada'}</p>
                            </div>
                        </div>
                    </div>

               <!-- Row 6: Analytics & Summary -->
                    
                    
            `;
            
            document.getElementById('detailModal').classList.remove('hidden');
        }

        function hideDetailModal() {
            document.getElementById('detailModal').classList.add('hidden');
        }

        function renderFullTable() {
            const tbody = document.getElementById('fullTableBody');
            tbody.innerHTML = '';
            
            allData.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                row.innerHTML = `
                    <td class="px-4 py-3 text-sm text-gray-900">${item.namaDetailMc}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.namaFileExcel}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.brandSize}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">${item.brand}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.order}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.assortment}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.etd1}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.shipmentPlan}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.etd2}</td>
                    <td class="px-4 py-3 text-sm font-medium text-blue-600">${item.stock.toLocaleString('id-ID')}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.lama}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.pr}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.polos}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.karantina}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">${item.estimasi}</td>
                    <td class="px-4 py-3 text-sm font-medium text-green-600">${item.total.toLocaleString('id-ID')}</td>
                    <td class="px-4 py-3 text-sm">
                        <button onclick="showDetailModal(${item.id})" class="text-blue-600 hover:text-blue-900">👁️ Detail</button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }

        function renderTable() {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            document.getElementById('showingCount').textContent = filteredData.length.toLocaleString('id-ID');
            document.getElementById('totalCount').textContent = allData.length.toLocaleString('id-ID');
            
            filteredData.forEach(item => {
                
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 fade-in';
                
                row.innerHTML = `
                    <td class="px-3 lg:px-6 py-4">
                        <div class="font-medium text-gray-900 text-sm lg:text-base">${item.brand}</div>
                        <div class="text-xs lg:text-sm text-gray-500 lg:hidden">${item.brandSize}</div>
                        <div class="text-xs text-gray-400 truncate max-w-32 lg:max-w-none">${item.namaDetailMc}</div>
                    </td>
                    <td class="px-3 lg:px-6 py-4 text-sm text-gray-900 mobile-hidden">${item.brandSize}</td>
                    <td class="px-3 lg:px-6 py-4 text-sm text-gray-900 mobile-hidden">${item.order}</td>
                    <td class="px-3 lg:px-6 py-4">
                        <div class="text-sm lg:text-base font-bold text-blue-600">${item.stock.toLocaleString('id-ID')}</div>
                        <div class="text-xs text-gray-500">Total: ${item.total.toLocaleString('id-ID')}</div>
                    </td>
                    <td class="px-3 lg:px-6 py-4 text-sm text-gray-900 mobile-hidden">${item.etd2 || item.etd1}</td>
                    
                    
                    <td class="px-3 lg:px-6 py-4">
                        <button onclick="showDetailModal(${item.id})" class="btn-professional bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                            <span>👁️</span>
                            <span class="mobile-hidden lg:inline">Detail</span>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        }



        function applyFilters() {
            const brandFilter = document.getElementById('brandFilter').value;
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            
            filteredData = allData.filter(item => {
                const matchesBrand = !brandFilter || item.brand === brandFilter;
                
                // Smart search across ALL fields
                const matchesSearch = !searchInput || 
                    item.namaDetailMc.toLowerCase().includes(searchInput) ||
                    item.namaFileExcel.toLowerCase().includes(searchInput) ||
                    item.brandSize.toLowerCase().includes(searchInput) ||
                    item.brand.toLowerCase().includes(searchInput) ||
                    item.order.toLowerCase().includes(searchInput) ||
                    item.assortment.toLowerCase().includes(searchInput) ||
                    item.etd1.toLowerCase().includes(searchInput) ||
                    item.shipmentPlan.toLowerCase().includes(searchInput) ||
                    item.etd2.toLowerCase().includes(searchInput) ||
                    item.stock.toString().includes(searchInput) ||
                    item.lama.toLowerCase().includes(searchInput) ||
                    item.pr.toLowerCase().includes(searchInput) ||
                    item.polos.toLowerCase().includes(searchInput) ||
                    item.karantina.toLowerCase().includes(searchInput) ||
                    item.estimasi.toLowerCase().includes(searchInput) ||
                    item.total.toString().includes(searchInput);
                
                return matchesBrand && matchesSearch;
            });
            
            renderTable();
        }

        // Toggle filter panel
        function toggleFilters() {
            const filtersPanel = document.getElementById('advancedFilters');
            const toggleIcon = document.getElementById('filterToggleIcon');
            
            if (filtersPanel.classList.contains('hidden')) {
                filtersPanel.classList.remove('hidden');
                filtersPanel.style.maxHeight = '0px';
                filtersPanel.style.overflow = 'hidden';
                filtersPanel.style.transition = 'max-height 0.3s ease-out';
                
                setTimeout(() => {
                    filtersPanel.style.maxHeight = filtersPanel.scrollHeight + 'px';
                }, 10);
                
                toggleIcon.style.transform = 'rotate(180deg)';
            } else {
                filtersPanel.style.maxHeight = '0px';
                toggleIcon.style.transform = 'rotate(0deg)';
                
                setTimeout(() => {
                    filtersPanel.classList.add('hidden');
                    filtersPanel.style.maxHeight = '';
                    filtersPanel.style.overflow = '';
                    filtersPanel.style.transition = '';
                }, 300);
            }
        }

        // Quick filter functions
        function quickFilter(type) {
            const searchInput = document.getElementById('searchInput');
            const brandFilter = document.getElementById('brandFilter');
            
            // Reset filters first
            searchInput.value = '';
            brandFilter.value = '';
            
            switch(type) {
                case 'low':
                    filteredData = allData.filter(item => item.stock < 100);
                    break;
                case 'medium':
                    filteredData = allData.filter(item => item.stock >= 100 && item.stock <= 500);
                    break;
                case 'high':
                    filteredData = allData.filter(item => item.stock > 500);
                    break;
                case 'all':
                default:
                    filteredData = [...allData];
                    break;
            }
            
            renderTable();
            showNotification(`Filter ${type === 'low' ? 'stok rendah' : type === 'medium' ? 'stok sedang' : type === 'high' ? 'stok tinggi' : 'semua data'} diterapkan!`, 'success');
        }

        // Event listeners
        document.getElementById('tableBtn').addEventListener('click', showTableModal);
        document.getElementById('closeTable').addEventListener('click', hideTableModal);
        document.getElementById('closeDetail').addEventListener('click', hideDetailModal);
        
        
        
        
        document.getElementById('filterToggle').addEventListener('click', toggleFilters);
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            const icon = document.getElementById('refreshIcon');
            icon.style.transform = 'rotate(360deg)';
            icon.style.transition = 'transform 0.5s';
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
                icon.style.transition = '';
            }, 500);
            loadData();
        });

        document.getElementById('brandFilter').addEventListener('change', applyFilters);
        document.getElementById('searchInput').addEventListener('input', applyFilters);
        
        
        
        

        // Load data on page load
        loadData();