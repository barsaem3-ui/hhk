document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const loginIdInput = document.getElementById('login-id');
    const loginPwInput = document.getElementById('login-pw');
    const loginError = document.getElementById('login-error');

    // Authentication Logic
    const AUTH_ID = 'barsaem3@gmail.com';
    const AUTH_PW = 'guswjd71';

    function checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            showApp();
        }
    }

    function showApp() {
        loginOverlay.classList.add('hidden');
        appContainer.classList.remove('hidden');
        // Load data once authenticated
        loadData();
        initHeaderGlass();
    }

    // Header Glass Logic
    function initHeaderGlass() {
        const glasses = document.querySelectorAll('.header-glass');

        function updateGlass(el) {
            const size = Math.floor(Math.random() * 40) + 20; // 20px - 60px
            const x = Math.floor(Math.random() * 80) + 10; // 10% - 90%
            const y = Math.floor(Math.random() * 60) + 20; // 20% - 80%
            const rot = Math.floor(Math.random() * 360);
            
            // Random Colors with 10% Opacity
            const colors = [
                'rgba(255, 255, 255, 0.1)', // White
                'rgba(76, 175, 80, 0.1)',   // Green
                'rgba(33, 150, 243, 0.1)',  // Blue
                'rgba(156, 39, 176, 0.1)',  // Purple
                'rgba(0, 188, 212, 0.1)'    // Cyan
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const dir = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 40) + 10); // Random degrees
            const mx = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 30) + 10); // Random move X
            const my = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);  // Random move Y

            el.style.setProperty('--size', `${size}px`);
            el.style.setProperty('--left', `${x}%`);
            el.style.setProperty('--top', `${y}%`);
            el.style.setProperty('--base-rot', `${rot}deg`);
            el.style.setProperty('--bg-color', color);
            el.style.setProperty('--dir', `${dir}deg`);
            el.style.setProperty('--move-x', `${mx}px`);
            el.style.setProperty('--move-y', `${my}px`);
            el.style.setProperty('--duration', `${Math.floor(Math.random() * 20) + 5}s`); // 5s to 25s
        }

        function refreshAll() {
            glasses.forEach(updateGlass);
        }

        refreshAll();
        setInterval(refreshAll, 30000); // 30 seconds
    }

    loginBtn.addEventListener('click', () => {
        const id = loginIdInput.value.trim();
        const pw = loginPwInput.value.trim();

        if (id === AUTH_ID && pw === AUTH_PW) {
            localStorage.setItem('isLoggedIn', 'true');
            showApp();
        } else {
            loginError.classList.remove('hidden');
            setTimeout(() => loginError.classList.add('hidden'), 3000);
        }
    });

    // Handle Enter key for login
    [loginIdInput, loginPwInput].forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loginBtn.click();
        });
    });

    checkAuth();

    const tableBody = document.getElementById('table-body');

    const addBtn = document.getElementById('add-btn');
    const printBtn = document.getElementById('print-btn');
    const rowTemplate = document.getElementById('row-template');

    // Auto format dates and numeric validation
    tableBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('input-field')) {
            const td = e.target.closest('td');
            if (td && td.classList.contains('col-quantity')) {
                // Numeric validation: only digits
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            }
            adjustFontSize(e.target);
        }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('input-field')) {
            const fontSize = parseFloat(e.target.style.fontSize);
            if (fontSize && fontSize < 0.8) { // Shrunk
                e.preventDefault();
                e.stopPropagation();
                openEditPopup(e.target, e.clientX, e.clientY);
            }
        }
    });

    tableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('input-field')) {
            const td = e.target.closest('td');
            if (td && (td.classList.contains('col-date') || td.classList.contains('col-process-date') || td.classList.contains('col-complete-date'))) {
                let val = e.target.value.trim();
                if (/^\d{4}$/.test(val)) {
                    e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
                }
            }
        }
    });

    // Column Resizer
    function initColumnResizers() {
        const ths = document.querySelectorAll('#data-table th');
        ths.forEach((th, colIndex) => {
            if (th.querySelector('.resizer')) return; // already added
            const resizer = document.createElement('div');
            resizer.classList.add('resizer');
            th.appendChild(resizer);
            
            // load saved width
            const savedWidth = localStorage.getItem(`colWidth_${colIndex}`);
            if (savedWidth) {
                th.style.width = savedWidth;
            }

            let startX, startWidth;
            resizer.addEventListener('mousedown', (e) => {
                startX = e.pageX;
                // Use style.width if set, otherwise fallback to offsetWidth to prevent jump
                const currentStyleWidth = th.style.width;
                if (currentStyleWidth && currentStyleWidth.includes('px')) {
                    startWidth = parseFloat(currentStyleWidth);
                } else {
                    startWidth = th.offsetWidth;
                }
                
                function onMouseMove(e) {
                    const newWidth = Math.max(startWidth + (e.pageX - startX), 20);
                    th.style.width = `${newWidth}px`;
                    
                    // Adjust font size for all inputs in this column in real-time
                    const rows = tableBody.querySelectorAll('.data-row');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        const input = cells[colIndex]?.querySelector('.input-field');
                        if (input) adjustFontSize(input);
                    });
                }
                function onMouseUp(e) {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    
                    // Automatically save widths on resize without modal
                    const allThs = document.querySelectorAll('#data-table th');
                    allThs.forEach((th, i) => {
                        if (th.style.width) {
                            localStorage.setItem(`colWidth_${i}`, th.style.width);
                        }
                    });
                }
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        });
    }

    function applyInitialWidths() {
        const ths = document.querySelectorAll('#data-table th');
        const tableWidth = document.getElementById('data-table').offsetWidth;
        
        let hasSavedWidths = false;
        for (let i = 0; i < ths.length; i++) {
            if (localStorage.getItem(`colWidth_${i}`)) {
                hasSavedWidths = true;
                break;
            }
        }

        if (hasSavedWidths) {
            ths.forEach((th, i) => {
                const saved = localStorage.getItem(`colWidth_${i}`);
                if (saved) th.style.width = saved;
            });
            document.querySelectorAll('.input-field').forEach(inp => adjustFontSize(inp));
            return;
        }

        // Default widths if nothing saved
        // Indices: 0:No, 1:날짜, 2:의뢰처, 3:사업명, 4:부품명, 5:도번, 6:수량, 7:내용, 8:처리, 9:처리일자, 10:완료, 11:완료일자, 12:댓글, 13:삭제
        const fixedWidths = {
            0: 15,  // No
            1: 22,  // 날짜
            2: 27,  // 의뢰처
            3: 33,  // 사업명
            4: 50,  // 부품명
            5: 43,  // 도번
            6: 20,  // 수량
            9: 25,  // 처리일자
            10: 15, // 완료
            11: 25, // 완료일자
            12: 20, // 댓글
            13: 15  // 삭제
        };

        let usedWidth = 0;
        Object.values(fixedWidths).forEach(w => usedWidth += w);
        const remainingWidth = Math.max(tableWidth - usedWidth, 200);

        ths.forEach((th, i) => {
            if (fixedWidths[i] !== undefined) {
                th.style.width = `${fixedWidths[i]}px`;
            } else if (i === 7) { // 내용
                th.style.width = `${remainingWidth * 0.6}px`;
            } else if (i === 8) { // 처리
                th.style.width = `${remainingWidth * 0.4}px`;
            }
        });

        // Adjust all font sizes after setting widths
        document.querySelectorAll('.input-field').forEach(inp => adjustFontSize(inp));
    }

    initColumnResizers();
    applyInitialWidths();
    
    // Window resize handler to maintain percentages if no manual widths saved
    window.addEventListener('resize', () => {
        let hasSavedWidths = false;
        const ths = document.querySelectorAll('#data-table th');
        for (let i = 0; i < ths.length; i++) {
            if (localStorage.getItem(`colWidth_${i}`)) {
                hasSavedWidths = true;
                break;
            }
        }
        if (!hasSavedWidths) applyInitialWidths();
    });
    
    // Modal Elements
    const confirmModal = document.getElementById('confirm-modal');
    const modalBtnYes = document.getElementById('modal-btn-yes');
    const modalBtnNo = document.getElementById('modal-btn-no');

    const editPopupModal = document.getElementById('edit-popup-modal');
    const editPopupInput = document.getElementById('edit-popup-input');
    
    let activeEditInput = null;
    let rowToDelete = null;
    let commentRowToDelete = null;
    let modalContext = ''; // 'delete-row' or 'save-widths'

    function openEditPopup(input, x, y) {
        activeEditInput = input;
        editPopupInput.value = input.value;
        
        // Position popup at cursor
        const glass = editPopupModal.querySelector('.edit-popup-glass');
        if (glass) {
            // Ensure popup doesn't go off screen
            const padding = 10;
            const glassWidth = 180;
            let left = x - (glassWidth / 2); // Center on click
            let top = y - 20;

            if (left + glassWidth > window.innerWidth) left = window.innerWidth - glassWidth - padding;
            if (left < padding) left = padding;
            
            glass.style.left = `${left}px`;
            glass.style.top = `${top}px`;
        }

        editPopupModal.classList.remove('hidden');
        
        // Auto-resize textarea to fit content
        setTimeout(() => {
            editPopupInput.style.height = 'auto';
            editPopupInput.style.height = editPopupInput.scrollHeight + 'px';
            editPopupInput.focus();
            editPopupInput.setSelectionRange(editPopupInput.value.length, editPopupInput.value.length);
        }, 100);
    }

    function closeAndSaveEdit() {
        if (activeEditInput) {
            // Replace newlines with spaces for single-line input-field
            activeEditInput.value = editPopupInput.value.replace(/\r?\n/g, ' ').trim();
            
            // Hide modal
            editPopupModal.classList.add('hidden');
            
            // Adjust font size
            setTimeout(() => {
                requestAnimationFrame(() => {
                    adjustFontSize(activeEditInput);
                    // Trigger change to ensure auto-save picks it up
                    activeEditInput.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }, 100);
        } else {
            editPopupModal.classList.add('hidden');
        }
    }

    // Auto-resize on input
    editPopupInput.addEventListener('input', () => {
        editPopupInput.style.height = 'auto';
        editPopupInput.style.height = editPopupInput.scrollHeight + 'px';
    });

    // Save on Enter (Shift+Enter for newline if needed)
    editPopupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            closeAndSaveEdit();
        } else if (e.key === 'Escape') {
            editPopupModal.classList.add('hidden');
        }
    });

    // Save on click outside
    editPopupModal.addEventListener('click', (e) => {
        // Only close if clicking the background overlay, not the glass panel itself
        if (e.target === editPopupModal) {
            closeAndSaveEdit();
        }
    });

    // Keyboard navigation
    tableBody.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('input-field')) {
            const currentCell = e.target.closest('td');
            const currentRow = e.target.closest('.data-row');
            
            if (!currentCell || !currentRow) return;
            
            const cells = Array.from(currentRow.querySelectorAll('td'));
            const colIndex = cells.indexOf(currentCell);
            let nextInput = null;
            
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                const isAtEnd = e.target.selectionStart === e.target.value.length;
                if (e.key === 'Enter' || isAtEnd) {
                    e.preventDefault();
                    if (colIndex < cells.length - 1) { // exclude last action cols
                        // Find next input-field in the row
                        for (let i = colIndex + 1; i < cells.length; i++) {
                            const inp = cells[i].querySelector('.input-field');
                            if (inp) {
                                nextInput = inp;
                                break;
                            }
                        }
                    }
                }
            } else if (e.key === 'ArrowLeft') {
                const isAtStart = e.target.selectionStart === 0 && e.target.selectionEnd === 0;
                if (isAtStart) {
                    e.preventDefault();
                    if (colIndex > 0) {
                        // Find previous input-field in the row
                        for (let i = colIndex - 1; i >= 0; i--) {
                            const inp = cells[i].querySelector('.input-field');
                            if (inp) {
                                nextInput = inp;
                                break;
                            }
                        }
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevRow = currentRow.previousElementSibling?.previousElementSibling;
                if (prevRow && prevRow.classList.contains('data-row')) {
                    nextInput = prevRow.querySelectorAll('td')[colIndex]?.querySelector('.input-field');
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextRow = currentRow.nextElementSibling?.nextElementSibling;
                if (nextRow && nextRow.classList.contains('data-row')) {
                    nextInput = nextRow.querySelectorAll('td')[colIndex]?.querySelector('.input-field');
                }
            }
            
            if (nextInput) {
                nextInput.focus();
            }
        }
    });

    // Excel-style Filtering logic
    const filterPopup = document.getElementById('filter-popup');
    const filterPopupList = document.getElementById('filter-popup-list');
    const filterBtnApply = document.getElementById('filter-btn-apply');
    const filterBtnClear = document.getElementById('filter-btn-clear');
    const filterSelectAll = document.getElementById('filter-select-all');
    const filterPopupSearchInput = document.getElementById('filter-popup-search-input');
    let currentFilterCol = -1;
    let activeFilters = {}; // { colIndex: [array of allowed values] }

    const filterBtns = document.querySelectorAll('.btn-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const col = parseInt(btn.getAttribute('data-col'));
            if (currentFilterCol === col && !filterPopup.classList.contains('hidden')) {
                filterPopup.classList.add('hidden');
                currentFilterCol = -1;
            } else {
                openFilterPopup(col, btn);
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!filterPopup.classList.contains('hidden') && !filterPopup.contains(e.target)) {
            filterPopup.classList.add('hidden');
            currentFilterCol = -1;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !filterPopup.classList.contains('hidden')) {
            filterPopup.classList.add('hidden');
            currentFilterCol = -1;
        }
    });

    filterPopupSearchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const labels = filterPopupList.querySelectorAll('label');
        labels.forEach(label => {
            const text = label.textContent.trim().toLowerCase();
            const cb = label.querySelector('.filter-item-cb');
            if (text.includes(term)) {
                label.style.display = 'flex';
                cb.checked = true; // Auto-check visible
            } else {
                label.style.display = 'none';
                cb.checked = false; // Auto-uncheck hidden
            }
        });
        
        // Update Select All state based on visible items
        const allVisibleCbs = Array.from(filterPopupList.querySelectorAll('.filter-item-cb')).filter(cb => cb.parentNode.style.display !== 'none');
        const checkedVisibleCbs = allVisibleCbs.filter(cb => cb.checked);
        filterSelectAll.checked = (allVisibleCbs.length > 0 && allVisibleCbs.length === checkedVisibleCbs.length);
    });

    function openFilterPopup(col, button) {
        currentFilterCol = col;
        filterPopupSearchInput.value = '';
        
        const rect = button.getBoundingClientRect();
        filterPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
        filterPopup.style.left = `${rect.left + window.scrollX - 100}px`;
        
        const rows = tableBody.querySelectorAll('.data-row');
        const values = new Set();
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const input = cells[col].querySelector('.input-field');
            const checkbox = cells[col].querySelector('.complete-checkbox');
            
            if (input) {
                values.add(input.value.trim());
            } else if (checkbox) {
                values.add(checkbox.checked ? '완료' : '미완료');
            }
        });
        
        filterPopupList.innerHTML = '';
        const uniqueValues = Array.from(values).sort();
        
        const allowedValues = activeFilters[col] || null;
        let allChecked = true;

        uniqueValues.forEach(val => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = val;
            cb.className = 'filter-item-cb';
            
            if (allowedValues === null || allowedValues.includes(val)) {
                cb.checked = true;
            } else {
                cb.checked = false;
                allChecked = false;
            }
            
            label.appendChild(cb);
            label.appendChild(document.createTextNode(val === '' ? '(빈 값)' : val));
            filterPopupList.appendChild(label);
            
            cb.addEventListener('change', () => {
                const allVisibleCbs = Array.from(filterPopupList.querySelectorAll('.filter-item-cb')).filter(c => c.parentNode.style.display !== 'none');
                const checkedVisibleCbs = allVisibleCbs.filter(c => c.checked);
                filterSelectAll.checked = (allVisibleCbs.length > 0 && allVisibleCbs.length === checkedVisibleCbs.length);
            });
        });
        
        filterSelectAll.checked = allChecked;
        filterPopup.classList.remove('hidden');
    }

    filterSelectAll.addEventListener('change', (e) => {
        const cbs = filterPopupList.querySelectorAll('.filter-item-cb');
        cbs.forEach(cb => {
            if (cb.parentNode.style.display !== 'none') {
                cb.checked = e.target.checked;
            }
        });
    });

    filterBtnApply.addEventListener('click', () => {
        const cbs = filterPopupList.querySelectorAll('.filter-item-cb');
        const selected = Array.from(cbs).filter(cb => cb.checked).map(cb => cb.value);
        
        const btn = document.querySelector(`.btn-filter[data-col="${currentFilterCol}"]`);
        
        // If all visible items are selected AND there is no active search filter that hid things
        // Actually, if all values in the column are selected, we remove the filter
        if (selected.length === cbs.length) {
            delete activeFilters[currentFilterCol];
            if (btn) btn.classList.remove('active');
        } else {
            activeFilters[currentFilterCol] = selected;
            if (btn) btn.classList.add('active');
        }
        
        if (btn) {
            btn.style.color = activeFilters[currentFilterCol] ? 'red' : '';
        }
        
        filterPopup.classList.add('hidden');
        applyTableFilters();
    });

    filterBtnClear.addEventListener('click', () => {
        delete activeFilters[currentFilterCol];
        const btn = document.querySelector(`.btn-filter[data-col="${currentFilterCol}"]`);
        if (btn) {
            btn.classList.remove('active');
            btn.style.color = '';
        }
        filterPopup.classList.add('hidden');
        applyTableFilters();
    });

    function applyTableFilters() {
        const rows = tableBody.querySelectorAll('.data-row');
        rows.forEach(row => {
            const commentRow = row.nextElementSibling;
            let match = true;
            
            const cells = row.querySelectorAll('td');
            for (let col in activeFilters) {
                const allowed = activeFilters[col];
                const input = cells[col].querySelector('.input-field');
                const checkbox = cells[col].querySelector('.complete-checkbox');
                
                let val = '';
                if (input) {
                    val = input.value.trim();
                } else if (checkbox) {
                    val = checkbox.checked ? '완료' : '미완료';
                }
                
                if (!allowed.includes(val)) {
                    match = false;
                    break;
                }
            }
            
            if (match) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
                if (commentRow && !commentRow.classList.contains('hidden')) {
                    commentRow.classList.add('hidden');
                }
            }
        });
    }

    // Helper: Adjust Font Size
    function adjustFontSize(input) {
        if (!input) return;
        
        // Wrap in requestAnimationFrame to ensure layout is settled
        requestAnimationFrame(() => {
            const originalFontSize = 0.85; // rem
            let fontSize = originalFontSize;
            
            const text = input.value || input.placeholder || '';
            if (!text) {
                input.style.fontSize = `${fontSize}rem`;
                input.classList.remove('shrunk-text');
                return;
            }

            const canvas = adjustFontSize.canvas || (adjustFontSize.canvas = document.createElement("canvas"));
            const context = canvas.getContext("2d");
            const style = window.getComputedStyle(input);
            context.font = `${fontSize}rem ${style.fontFamily}`;

            // Use getBoundingClientRect for more precision
            let maxWidth = input.getBoundingClientRect().width - 8; // standard padding
            
            // Fallback: If input width is too small, try parent td's width
            if (maxWidth <= 0) {
                const parentTd = input.closest('td');
                if (parentTd) {
                    maxWidth = parentTd.getBoundingClientRect().width - 10;
                }
            }

            // If still <= 0, we can't reliably measure
            if (maxWidth <= 0) return;

            // Reset to original before checking overflow
            input.style.fontSize = `${fontSize}rem`;
            input.classList.remove('shrunk-text');

            let metrics = context.measureText(text);
            if (metrics.width > maxWidth) {
                input.classList.add('shrunk-text');
                // Use a slightly more aggressive reduction if text is very long
                while (metrics.width > maxWidth && fontSize > 0.35) {
                    fontSize -= 0.04;
                    context.font = `${fontSize}rem ${style.fontFamily}`;
                    metrics = context.measureText(text);
                }
                input.style.fontSize = `${fontSize}rem`;
            }
        });
    }

    // Helper: Get Current Date Time
    function getCurrentDateTime() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }

    // Helper: Update Row Numbers
    function updateRowNumbers() {
        const rows = tableBody.querySelectorAll('.data-row');
        rows.forEach((row, index) => {
            const noCell = row.querySelector('.cell-no');
            if (noCell) {
                noCell.textContent = index + 1;
            }
        });
    }

    function addCommentItem(container, text, afterItem = null) {
        let cleanText = text;
        let timestamp = '';
        
        // Parse timestamp if exists: "text MM/DD" or "text (MM/DD)"
        const tsMatch = text.match(/\(?(\d{2}\/\d{2})\)?$/);
        if (tsMatch) {
            timestamp = tsMatch[1];
            cleanText = text.replace(/\s?\(?\d{2}\/\d{2}\)?$/, '').trim();
        } else if (!text || text.trim() === '') {
            // New comment, generate fresh timestamp (date only)
            const now = new Date();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            timestamp = `${mm}/${dd}`;
        }

        const index = container.children.length;
        const item = document.createElement('div');
        item.className = 'comment-item';
        
        const prefix = document.createElement('span');
        if (index === 0) {
            prefix.className = 'comment-prefix-arrow';
            prefix.textContent = '└> ';
        } else {
            prefix.className = 'comment-prefix-next';
            prefix.textContent = '⇒ ';
        }
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'comment-input-field';
        input.value = cleanText;
        input.placeholder = '댓글 입력...';
        
        // Mirror span for precise width calculation
        const mirror = document.createElement('span');
        mirror.style.visibility = 'hidden';
        mirror.style.position = 'absolute';
        mirror.style.whiteSpace = 'pre';
        mirror.style.fontSize = '0.75rem';
        mirror.style.fontFamily = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        mirror.style.padding = '0'; // No padding for measurement
        document.body.appendChild(mirror);

        const updateWidth = () => {
            // Measure base text
            mirror.textContent = input.value || input.placeholder || '';
            const textWidth = mirror.offsetWidth;
            
            // Measure one character width
            mirror.textContent = '0';
            const charWidth = mirror.offsetWidth;
            
            // Total width = text + 1 character
            input.style.width = `${textWidth + charWidth}px`;
        };

        input.addEventListener('input', updateWidth);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
        setTimeout(updateWidth, 0);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'comment-timestamp';
        timeSpan.textContent = timestamp ? `${timestamp}` : '';

        const replyBtn = document.createElement('button');
        replyBtn.className = 'btn-reply-comment';
        replyBtn.textContent = '답글';
        replyBtn.addEventListener('click', () => {
            // Insert new comment item after this one
            addCommentItem(container, '', item);
            recalculateCommentPrefixes(container);
            updateCountInRow(container);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-comment';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            const items = Array.from(container.children);
            const myIndex = items.indexOf(item);
            
            if (myIndex === items.length - 1) {
                modalContext = 'delete-last-comment';
                activeCommentToDelete = item;
                document.getElementById('modal-title').textContent = '댓글 삭제';
                document.getElementById('modal-message').textContent = '이 댓글을 삭제하시겠습니까?';
                modalBtnYes.className = 'btn btn-danger';
                confirmModal.classList.remove('hidden');
            } else {
                modalContext = 'delete-linked-comments';
                activeCommentToDelete = item;
                document.getElementById('modal-title').textContent = '연쇄 삭제 확인';
                document.getElementById('modal-message').innerHTML = '현재를 포함한 이후 모든 댓글을 삭제하시겠습니까?';
                modalBtnYes.className = 'btn btn-danger';
                confirmModal.classList.remove('hidden');
            }
        });

        item.appendChild(prefix);
        item.appendChild(timeSpan);
        item.appendChild(input);
        item.appendChild(replyBtn);
        item.appendChild(deleteBtn);
        
        if (afterItem) {
            container.insertBefore(item, afterItem.nextSibling);
        } else {
            container.appendChild(item);
        }
        
        updateCountInRow(container);
        if (!text) input.focus();

        // Cleanup mirror when item is removed
        const originalRemove = item.remove;
        item.remove = function() {
            if (mirror.parentNode) mirror.parentNode.removeChild(mirror);
            originalRemove.apply(this, arguments);
        };
    }

    function updateCountInRow(container) {
        const commentRow = container.closest('.comment-row');
        if (commentRow) {
            const count = container.children.length;
            
            // Hide the comment row if it's empty to prevent white space between rows
            if (count === 0) {
                commentRow.classList.add('hidden');
            }

            const dataRow = commentRow.previousElementSibling;
            if (dataRow && dataRow.classList.contains('data-row')) {
                const countSpan = dataRow.querySelector('.comment-count');
                if (countSpan) {
                    countSpan.textContent = count;
                }
            }
        }
    }

    function recalculateCommentPrefixes(container) {
        const items = Array.from(container.children);
        items.forEach((item, index) => {
            const prefixSpan = item.querySelector('span');
            if (prefixSpan) {
                if (index === 0) {
                    prefixSpan.className = 'comment-prefix-arrow';
                    prefixSpan.textContent = '└> ';
                } else {
                    prefixSpan.className = 'comment-prefix-next';
                    prefixSpan.textContent = '⇒ ';
                }
            }
        });
    }

    let activeCommentToDelete = null;

    function parseComments(noteStr) {
        if (!noteStr) return [];
        return noteStr.split('\n').filter(s => s.trim().length > 0).map(s => {
            let text = s.trim();
            // Strip prefixes: └>, ⇒, and any leading arrows
            text = text.replace(/^[└⇒>⇒\s]+/, '').trim();
            return { text: text, depth: 0 }; // Depth logic simplified for now
        });
    }

    // Add a new row
    function addNewRow(rowData = null) {
        const templateContent = rowTemplate.content.cloneNode(true);
        const dataRow = templateContent.querySelector('.data-row');
        const commentRow = templateContent.querySelector('.comment-row');

        if (rowData) {
            dataRow.querySelector('.col-date .input-field').value = rowData['날짜'] || '';
            dataRow.querySelector('.col-client .input-field').value = rowData['의뢰처'] || '';
            dataRow.querySelector('.col-project .input-field').value = rowData['사업명'] || '';
            dataRow.querySelector('.col-part .input-field').value = rowData['부품명'] || '';
            dataRow.querySelector('.col-drawing .input-field').value = rowData['도번'] || '';
            dataRow.querySelector('.col-quantity .input-field').value = rowData['수량'] || '';
            dataRow.querySelector('.col-content .input-field').value = rowData['내용'] || '';
            dataRow.querySelector('.col-process .input-field').value = rowData['처리'] || '';
            dataRow.querySelector('.col-process-date .input-field').value = rowData['처리일자'] || '';
            dataRow.querySelector('.col-complete-date .input-field').value = rowData['완료일자'] || '';
            
            dataRow.querySelectorAll('.input-field').forEach(input => {
                setTimeout(() => adjustFontSize(input), 0);
            });
        }

        const completeCheckbox = dataRow.querySelector('.complete-checkbox');
        
        function updateCompletionStyle() {
            if (completeCheckbox.checked) {
                dataRow.style.textDecoration = 'line-through';
                dataRow.style.color = '#999';
                dataRow.querySelectorAll('.input-field').forEach(input => {
                    input.style.textDecoration = 'line-through';
                    input.style.color = '#999';
                });
            } else {
                dataRow.style.textDecoration = 'none';
                dataRow.style.color = '';
                dataRow.querySelectorAll('.input-field').forEach(input => {
                    input.style.textDecoration = 'none';
                    input.style.color = '';
                });
            }
        }

        if (rowData && rowData['완료여부'] === 'O') {
            completeCheckbox.checked = true;
            updateCompletionStyle();
        }

        completeCheckbox.addEventListener('change', () => {
            if (completeCheckbox.checked) {
                const completeDateInput = dataRow.querySelector('.col-complete-date .input-field');
                if (completeDateInput && !completeDateInput.value.trim()) {
                    const now = new Date();
                    const mm = String(now.getMonth() + 1).padStart(2, '0');
                    const dd = String(now.getDate()).padStart(2, '0');
                    completeDateInput.value = `${mm}/${dd}`;
                }
            }
            updateCompletionStyle();
            applyTableFilters();
        });

        const deleteRowBtn = dataRow.querySelector('.btn-delete-row');
        deleteRowBtn.addEventListener('click', () => {
            rowToDelete = dataRow;
            commentRowToDelete = commentRow;
            modalContext = 'delete-row';
            document.getElementById('modal-title').textContent = '삭제 확인';
            document.getElementById('modal-message').textContent = '삭제하시겠습니까?';
            modalBtnYes.className = 'btn btn-danger';
            confirmModal.classList.remove('hidden');
        });

        const commentBtn = dataRow.querySelector('.btn-comment');
        const commentCountSpan = dataRow.querySelector('.comment-count');
        const commentList = commentRow.querySelector('.comment-list');

        function updateCommentCount() {
            if (commentCountSpan) {
                const count = commentList.querySelectorAll('.comment-item').length;
                commentCountSpan.textContent = count;
            }
        }

        commentBtn.addEventListener('click', () => {
            commentRow.classList.toggle('hidden');
            if (!commentRow.classList.contains('hidden') && commentList.children.length === 0) {
                addCommentItem(commentList, '');
            }
        });

        const commentInputArea = commentRow.querySelector('.comment-input-area');
        if (commentInputArea) commentInputArea.remove(); // Remove old input area

        if (rowData && rowData['비고']) {
            const lines = rowData['비고'].split('\n');
            lines.forEach(line => {
                // Remove ALL leading prefixes, arrows, and spaces at the start of the line
                let cleanText = line.replace(/^[└⇒\s>]+/, '').trim();
                if (cleanText) addCommentItem(commentList, cleanText);
            });
            updateCountInRow(commentList);
        }

        tableBody.appendChild(dataRow);
        tableBody.appendChild(commentRow);
        applyTableFilters(); // Re-apply filters if a new row is added
        updateRowNumbers();
    }

    // Event listener for adding new items
    addBtn.addEventListener('click', () => addNewRow(null));

    // Event listener for printing
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Unified Data Handling (Electron + Web)
    async function fetchData() {
        if (window.electronAPI) {
            return await window.electronAPI.loadData();
        } else {
            const response = await fetch('/api/data');
            return await response.json();
        }
    }

    async function saveData(rows) {
        if (window.electronAPI) {
            return await window.electronAPI.saveData(rows);
        } else {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rows)
            });
            return await response.json();
        }
    }

    // Sync Logic
    const syncStatus = document.getElementById('sync-status');

    function gatherRows() {
        const rows = [];
        const dataRows = tableBody.querySelectorAll('.data-row');
        dataRows.forEach(row => {
            const commentRow = row.nextElementSibling;
            const items = commentRow.querySelectorAll('.comment-item');
            let noteStr = [];
            items.forEach((item, idx) => {
                const input = item.querySelector('.comment-input-field');
                const timeSpan = item.querySelector('.comment-timestamp');
                const text = input ? input.value : '';
                const time = timeSpan ? timeSpan.textContent : '';
                const prefix = (idx === 0) ? '└>' : '⇒';
                // Store as "text timestamp" (no parentheses)
                noteStr.push(`${prefix}${text} ${time}`.trim());
            });
            const isCompleted = row.querySelector('.complete-checkbox').checked;

            rows.push({
                '날짜': row.querySelector('.col-date .input-field').value,
                '의뢰처': row.querySelector('.col-client .input-field').value,
                '사업명': row.querySelector('.col-project .input-field').value,
                '부품명': row.querySelector('.col-part .input-field').value,
                '도번': row.querySelector('.col-drawing .input-field').value,
                '수량': row.querySelector('.col-quantity .input-field').value,
                '내용': row.querySelector('.col-content .input-field').value,
                '처리': row.querySelector('.col-process .input-field').value,
                '처리일자': row.querySelector('.col-process-date .input-field').value,
                '완료일자': row.querySelector('.col-complete-date .input-field').value,
                '비고': noteStr.join('\n'),
                '완료여부': isCompleted ? 'O' : ''
            });
        });
        return rows;
    }

    let initialLoadComplete = false;
    let isSaving = false;

    async function autoSaveData() {
        // SAFETY: Never save if initial load failed or hasn't happened yet
        if (!initialLoadComplete || isSaving) return;
        
        const rows = gatherRows();
        
        // SAFETY: If table is empty (only 1 row and it's empty), don't overwrite the excel
        // unless we are absolutely sure the user wanted to clear everything.
        if (rows.length === 1) {
            const firstRow = rows[0];
            const isEmpty = !firstRow['날짜'] && !firstRow['의뢰처'] && !firstRow['사업명'] && !firstRow['비고'];
            if (isEmpty) {
                console.warn('Prevented auto-save of empty table to protect data.');
                return;
            }
        }

        isSaving = true;
        try {
            await saveData(rows);
            if(syncStatus) {
                syncStatus.textContent = '● 자동 저장됨 (' + new Date().toLocaleTimeString() + ')';
                syncStatus.style.color = '#a5d6a7';
            }
        } catch (error) {
            console.error('Save error:', error);
            if(syncStatus) {
                syncStatus.textContent = '● 저장 오류 (엑셀을 닫아주세요)';
                syncStatus.style.color = '#ef5350';
            }
        } finally {
            isSaving = false;
        }
    }

    // Automatically start auto-saving every 5 seconds
    setInterval(autoSaveData, 5000);

    // Modal Event Listeners
    modalBtnNo.addEventListener('click', () => {
        rowToDelete = null;
        commentRowToDelete = null;
        modalContext = '';
        confirmModal.classList.add('hidden');
    });

    modalBtnYes.addEventListener('click', () => {
        if (modalContext === 'delete-row') {
            if (rowToDelete && commentRowToDelete) {
                rowToDelete.remove();
                commentRowToDelete.remove();
            }
            updateRowNumbers();
        } else if (modalContext === 'save-widths') {
            const allThs = document.querySelectorAll('#data-table th');
            allThs.forEach((th, i) => {
                localStorage.setItem(`colWidth_${i}`, th.style.width);
            });
        } else if (modalContext === 'delete-last-comment') {
            if (activeCommentToDelete) {
                const container = activeCommentToDelete.parentElement;
                activeCommentToDelete.remove();
                updateCountInRow(container);
            }
        } else if (modalContext === 'delete-linked-comments') {
            if (activeCommentToDelete) {
                const container = activeCommentToDelete.parentElement;
                const items = Array.from(container.children);
                const startIdx = items.indexOf(activeCommentToDelete);
                for (let i = items.length - 1; i >= startIdx; i--) {
                    items[i].remove();
                }
                recalculateCommentPrefixes(container);
                updateCountInRow(container);
            }
        }
        
        rowToDelete = null;
        commentRowToDelete = null;
        activeCommentToDelete = null;
        modalContext = '';
        confirmModal.classList.add('hidden');
    });

    // Load data (Unified)
    async function loadData() {
        try {
            const data = await fetchData();
            tableBody.innerHTML = '';
            
            if (data && data.length > 0) {
                data.forEach(row => addNewRow(row));
                initialLoadComplete = true; // SUCCESS
            } else {
                console.log('No data found, adding empty row.');
                addNewRow(null); 
                initialLoadComplete = true; // Still success but empty
            }
            applyInitialWidths();
        } catch (error) {
            console.error('CRITICAL: Cannot load data:', error);
            if (tableBody.children.length === 0) {
                addNewRow(null);
            }
            // SAFETY: Keep initialLoadComplete = false to prevent auto-saving empty table
            initialLoadComplete = false; 
            if(syncStatus) {
                syncStatus.textContent = '● 데이터 로드 실패 (저장 비활성화)';
                syncStatus.style.color = '#ff9800';
            }
        }
    }

    loadData();

    // Polling for multi-device sync (every 30 seconds)
    // Only refresh if no input is currently focused to avoid disrupting the user
    setInterval(async () => {
        const activeEl = document.activeElement;
        const isEditing = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.classList.contains('input-field'));
        
        if (!isEditing && !confirmModal.classList.contains('hidden') === false) {
            console.log('Polling for updates...');
            try {
                const newData = await fetchData();
                // Simple sync: if row count changed or we want to force refresh
                // For now, let's just reload if not editing. 
                // In a production app, we would compare data and only update changed rows.
                if (newData && newData.length > 0) {
                    // Check if data actually changed to avoid unnecessary flickering
                    // (Omitted for simplicity, but good for future improvement)
                    loadData(); 
                }
            } catch (e) {
                console.error('Polling error:', e);
            }
        }
    }, 30000);
});
