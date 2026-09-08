/**
 * Client Management System - JavaScript (app.js)
 * Clean Architecture & LocalStorage Database
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Database Layer (LocalStorage Wrapper)
       ========================================================================== */
    const STORAGE_KEY = 'clients_db';

    const DB = {
        /**
         * Fetch all clients from localStorage
         * @returns {Array} Array of client objects
         */
        getAll() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) {
                console.error('Error reading from localStorage:', e);
                return [];
            }
        },

        /**
         * Save all clients array to localStorage
         * @param {Array} clients
         */
        saveAll(clients) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
            } catch (e) {
                console.error('Error writing to localStorage:', e);
                Toast.show('حدث خطأ أثناء حفظ البيانات في التخزين المحلي', 'error');
            }
        },

        /**
         * Find client by National ID (Primary Key)
         * @param {string} nationalId
         * @returns {Object|null} Client record or null
         */
        findByNationalId(nationalId) {
            const clients = DB.getAll();
            const cleanId = String(nationalId).trim();
            return clients.find(c => String(c.nationalId).trim() === cleanId) || null;
        },

        /**
         * Add a new client record
         * @param {Object} client
         * @returns {boolean} Success status
         */
        insert(client) {
            const clients = DB.getAll();
            const newRecord = {
                ...client,
                clientName: client.clientName.trim(),
                phoneNumber: client.phoneNumber.trim(),
                nationalId: client.nationalId.trim(),
                createdAt: new Date().toISOString()
            };
            clients.push(newRecord);
            DB.saveAll(clients);
            return true;
        },

        /**
         * Update an existing client record by National ID
         * @param {string} nationalId - Original ID
         * @param {Object} updatedData
         * @returns {boolean} Success status
         */
        update(nationalId, updatedData) {
            const clients = DB.getAll();
            const index = clients.findIndex(c => String(c.nationalId).trim() === String(nationalId).trim());
            if (index === -1) return false;

            clients[index] = {
                ...clients[index],
                clientName: updatedData.clientName.trim(),
                phoneNumber: updatedData.phoneNumber.trim(),
                nationalId: updatedData.nationalId.trim(),
                updatedAt: new Date().toISOString()
            };

            DB.saveAll(clients);
            return true;
        },

        /**
         * Delete a client record by National ID
         * @param {string} nationalId
         * @returns {boolean} Success status
         */
        delete(nationalId) {
            const clients = DB.getAll();
            const filtered = clients.filter(c => String(c.nationalId).trim() !== String(nationalId).trim());
            if (filtered.length === clients.length) return false;

            DB.saveAll(filtered);
            return true;
        }
    };

    /* ==========================================================================
       2. UI Notification & Modal System
       ========================================================================== */
    const Toast = {
        container: document.getElementById('toastContainer'),

        /**
         * Display a toast notification message
         * @param {string} message
         * @param {string} type - 'success' | 'error' | 'warning' | 'info'
         */
        show(message, type = 'success') {
            if (!this.container) return;

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            let iconClass = 'fa-check-circle';
            if (type === 'error') iconClass = 'fa-circle-xmark';
            if (type === 'warning') iconClass = 'fa-triangle-exclamation';
            if (type === 'info') iconClass = 'fa-circle-info';

            toast.innerHTML = `
                <i class="fa-solid ${iconClass}"></i>
                <span>${message}</span>
            `;

            this.container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-20px)';
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }
    };

    const ConfirmModal = {
        backdrop: document.getElementById('confirmModal'),
        titleEl: document.getElementById('confirmModalTitle'),
        msgEl: document.getElementById('confirmModalMessage'),
        okBtn: document.getElementById('confirmOkBtn'),
        cancelBtn: document.getElementById('confirmCancelBtn'),
        closeBtn: document.getElementById('closeConfirmModalBtn'),
        onConfirmCallback: null,

        init() {
            if (!this.backdrop) return;

            const close = () => this.hide();
            this.cancelBtn?.addEventListener('click', close);
            this.closeBtn?.addEventListener('click', close);

            this.okBtn?.addEventListener('click', () => {
                if (typeof this.onConfirmCallback === 'function') {
                    this.onConfirmCallback();
                }
                this.hide();
            });

            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.hide();
            });
        },

        show(title, message, onConfirm, okButtonText = 'تأكيد', isDanger = false) {
            if (!this.backdrop) return;
            this.titleEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation ${isDanger ? 'text-danger' : 'text-warning'}"></i> ${title}`;
            this.msgEl.textContent = message;
            this.onConfirmCallback = onConfirm;

            if (this.okBtn) {
                this.okBtn.textContent = okButtonText;
                this.okBtn.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';
            }

            this.backdrop.classList.remove('hidden');
        },

        hide() {
            this.backdrop?.classList.add('hidden');
            this.onConfirmCallback = null;
        }
    };
    ConfirmModal.init();

    /* ==========================================================================
       3. View Switcher Module
       ========================================================================== */
    const navigationModule = {
        regView: document.getElementById('registrationView'),
        dbView: document.getElementById('databaseView'),
        navToDbBtn: document.getElementById('navToDatabaseBtn'),
        navToRegBtn: document.getElementById('navToRegisterBtn'),

        init() {
            this.navToDbBtn?.addEventListener('click', () => this.switchTo('database'));
            this.navToRegBtn?.addEventListener('click', () => this.switchTo('registration'));
        },

        switchTo(viewName) {
            if (viewName === 'database') {
                this.regView?.classList.add('hidden');
                this.dbView?.classList.remove('hidden');
                this.navToDbBtn?.classList.add('hidden');
                this.navToRegBtn?.classList.remove('hidden');
                renderDatabaseTable();
            } else {
                this.dbView?.classList.add('hidden');
                this.regView?.classList.remove('hidden');
                this.navToRegBtn?.classList.add('hidden');
                this.navToDbBtn?.classList.remove('hidden');
            }
        }
    };
    navigationModule.init();

    /* ==========================================================================
       4. Validation Helpers
       ========================================================================== */
    function validateField(input, errorEl, message) {
        const val = input ? input.value.trim() : '';
        if (!val) {
            if (input) input.classList.add('is-invalid');
            if (errorEl) errorEl.textContent = message;
            return false;
        } else {
            if (input) input.classList.remove('is-invalid');
            if (errorEl) errorEl.textContent = '';
            return true;
        }
    }

    function clearErrors(form) {
        if (!form) return;
        const inputs = form.querySelectorAll('.form-control');
        const errors = form.querySelectorAll('.error-msg');
        inputs.forEach(i => i.classList.remove('is-invalid'));
        errors.forEach(e => e.textContent = '');
    }

    /* ==========================================================================
       5. Registration Form Handler
       ========================================================================== */
    const registerForm = document.getElementById('clientRegisterForm');
    const clientNameInput = document.getElementById('clientName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const nationalIdInput = document.getElementById('nationalId');

    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const idError = document.getElementById('idError');

    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateField(clientNameInput, nameError, 'يرجى إدخال اسم العميل');
        const isPhoneValid = validateField(phoneNumberInput, phoneError, 'يرجى إدخال رقم الهاتف');
        const isIdValid = validateField(nationalIdInput, idError, 'يرجى إدخال رقم الهوية');

        if (!isNameValid || !isPhoneValid || !isIdValid) {
            return;
        }

        const clientData = {
            clientName: clientNameInput.value.trim(),
            phoneNumber: phoneNumberInput.value.trim(),
            nationalId: nationalIdInput.value.trim()
        };

        // Check if National ID already exists
        const existingClient = DB.findByNationalId(clientData.nationalId);

        if (existingClient) {
            // Prompt confirmation asking to update existing record
            ConfirmModal.show(
                'تنبيه: العميل مسجل مسبقاً',
                `رقم الهوية (${clientData.nationalId}) موجود بالفعل باسم "${existingClient.clientName}". هل ترغب في تحديث بيانات العميل الحالية؟`,
                () => {
                    DB.update(clientData.nationalId, clientData);
                    Toast.show('تم تحديث بيانات العميل بنجاح!', 'success');
                    registerForm.reset();
                    clearErrors(registerForm);
                },
                'تحديث البيانات',
                false
            );
        } else {
            // Save new client
            DB.insert(clientData);
            Toast.show('تم تسجيل بيانات العميل بنجاح!', 'success');
            registerForm.reset();
            clearErrors(registerForm);
        }
    });

    /* ==========================================================================
       6. Search Section Logic
       ========================================================================== */
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResultArea = document.getElementById('searchResultArea');
    const resetSearchBtn = document.getElementById('resetSearchBtn');

    searchForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchId = searchInput.value.trim();
        if (!searchId) return;

        const client = DB.findByNationalId(searchId);

        searchResultArea.classList.remove('hidden');
        resetSearchBtn.classList.remove('hidden');

        if (client) {
            searchResultArea.innerHTML = `
                <div class="client-profile-card">
                    <div class="profile-info-grid">
                        <div class="info-item">
                            <span class="label">اسم العميل:</span>
                            <span class="value">${escapeHtml(client.clientName)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">رقم الهاتف:</span>
                            <span class="value">${escapeHtml(client.phoneNumber)}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">رقم الهوية:</span>
                            <span class="value">${escapeHtml(client.nationalId)}</span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${escapeHtml(client.nationalId)}">
                            <i class="fa-solid fa-pen"></i> تعديل
                        </button>
                        <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${escapeHtml(client.nationalId)}">
                            <i class="fa-solid fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
            `;
            attachCardActionListeners(searchResultArea);
        } else {
            searchResultArea.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>لم يتم العثور على أي بيانات لهرقم الهوية</span>
                </div>
            `;
        }
    });

    resetSearchBtn?.addEventListener('click', () => {
        searchInput.value = '';
        searchResultArea.innerHTML = '';
        searchResultArea.classList.add('hidden');
        resetSearchBtn.classList.add('hidden');
    });

    /* ==========================================================================
       7. Database View & Table Rendering
       ========================================================================== */
    const clientsTableBody = document.getElementById('clientsTableBody');
    const emptyDatabaseState = document.getElementById('emptyDatabaseState');
    const clientCountBadge = document.getElementById('clientCountBadge');

    function renderDatabaseTable() {
        if (!clientsTableBody) return;

        const clients = DB.getAll();
        clientCountBadge.textContent = `${clients.length} عميل`;

        if (clients.length === 0) {
            clientsTableBody.innerHTML = '';
            emptyDatabaseState?.classList.remove('hidden');
            return;
        }

        emptyDatabaseState?.classList.add('hidden');

        clientsTableBody.innerHTML = clients.map((client, index) => {
            const createdDate = client.createdAt ? new Date(client.createdAt).toLocaleDateString('ar-EG') : 'غير محدد';
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${escapeHtml(client.clientName)}</strong></td>
                    <td>${escapeHtml(client.phoneNumber)}</td>
                    <td><code>${escapeHtml(client.nationalId)}</code></td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-buttons-cell">
                            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${escapeHtml(client.nationalId)}">
                                <i class="fa-solid fa-pen"></i> تعديل
                            </button>
                            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${escapeHtml(client.nationalId)}">
                                <i class="fa-solid fa-trash"></i> حذف
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        attachCardActionListeners(clientsTableBody);
    }

    function attachCardActionListeners(parentEl) {
        const editButtons = parentEl.querySelectorAll('.edit-btn');
        const deleteButtons = parentEl.querySelectorAll('.delete-btn');

        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                confirmDeleteClient(id);
            });
        });
    }

    /* ==========================================================================
       8. Edit & Delete Action Handlers
       ========================================================================== */
    const editModal = document.getElementById('editModal');
    const editClientForm = document.getElementById('editClientForm');
    const originalNationalIdInput = document.getElementById('originalNationalId');
    const editClientNameInput = document.getElementById('editClientName');
    const editPhoneNumberInput = document.getElementById('editPhoneNumber');
    const editNationalIdInput = document.getElementById('editNationalId');

    const editNameError = document.getElementById('editNameError');
    const editPhoneError = document.getElementById('editPhoneError');
    const editIdError = document.getElementById('editIdError');

    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    function openEditModal(nationalId) {
        const client = DB.findByNationalId(nationalId);
        if (!client) {
            Toast.show('لم يتم العثور على العميل المطلوب', 'error');
            return;
        }

        clearErrors(editClientForm);
        originalNationalIdInput.value = client.nationalId;
        editClientNameInput.value = client.clientName;
        editPhoneNumberInput.value = client.phoneNumber;
        editNationalIdInput.value = client.nationalId;

        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        editModal?.classList.add('hidden');
    }

    closeEditModalBtn?.addEventListener('click', closeEditModal);
    cancelEditBtn?.addEventListener('click', closeEditModal);
    editModal?.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    editClientForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const isNameValid = validateField(editClientNameInput, editNameError, 'يرجى إدخال اسم العميل');
        const isPhoneValid = validateField(editPhoneNumberInput, editPhoneError, 'يرجى إدخال رقم الهاتف');
        const isIdValid = validateField(editNationalIdInput, editIdError, 'يرجى إدخال رقم الهوية');

        if (!isNameValid || !isPhoneValid || !isIdValid) return;

        const origId = originalNationalIdInput.value;
        const newId = editNationalIdInput.value.trim();

        // Check if ID changed and new ID already exists
        if (origId !== newId && DB.findByNationalId(newId)) {
            if (editIdError) editIdError.textContent = 'رقم الهوية الجديد مستخدم بالفعل لعميل آخر';
            return;
        }

        const updatedData = {
            clientName: editClientNameInput.value.trim(),
            phoneNumber: editPhoneNumberInput.value.trim(),
            nationalId: newId
        };

        DB.update(origId, updatedData);
        Toast.show('تم تعديل بيانات العميل بنجاح!', 'success');
        closeEditModal();
        renderDatabaseTable();

        // Refresh search view if search input matches
        if (searchInput.value.trim() === origId || searchInput.value.trim() === newId) {
            searchForm.dispatchEvent(new Event('submit'));
        }
    });

    function confirmDeleteClient(nationalId) {
        const client = DB.findByNationalId(nationalId);
        if (!client) return;

        ConfirmModal.show(
            'حذف بيانات العميل',
            `هل أنت متأكد من حذف بيانات العميل "${client.clientName}" صاحب رقم الهوية (${client.nationalId}) نهائياً؟`,
            () => {
                DB.delete(nationalId);
                Toast.show('تم حذف العميل بنجاح', 'info');
                renderDatabaseTable();

                // If currently searched item is deleted, clear search result
                if (searchInput.value.trim() === String(nationalId).trim()) {
                    resetSearchBtn.click();
                }
            },
            'حذف العميل',
            true
        );
    }

    /* ==========================================================================
       9. Backup & CSV Export Logic
       ========================================================================== */
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    exportCsvBtn?.addEventListener('click', () => {
        const clients = DB.getAll();
        if (clients.length === 0) {
            Toast.show('لا توجد بيانات متاحة للتصدير', 'warning');
            return;
        }

        // CSV Header
        let csvContent = 'اسم المستخدم,رقم الهاتف,رقم الهوية,تاريخ التسجيل\n';

        // Add Rows
        clients.forEach(c => {
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '';
            const name = `"${c.clientName.replace(/"/g, '""')}"`;
            const phone = `"${c.phoneNumber.replace(/"/g, '""')}"`;
            const id = `"${c.nationalId.replace(/"/g, '""')}"`;
            const date = `"${dateStr}"`;

            csvContent += `${name},${phone},${id},${date}\n`;
        });

        // Add UTF-8 BOM byte order mark (\uFEFF) for proper Excel Arabic rendering
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `نسخة_احتياطية_العملاء_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Toast.show('تم تصدير النسخة الاحتياطية بنجاح!', 'success');
    });

    /* ==========================================================================
       10. Utility Functions
       ========================================================================== */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

});
