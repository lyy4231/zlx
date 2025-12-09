
        // 模拟用户数据库
        const users = [
            { id: '2021001', password: '123456', name: '张三', class: '大数据A班' },
            { id: '2021002', password: '123456', name: '李四', class: '计算机科学B班' },
            { id: '2021003', password: '123456', name: '王五', class: '软件工程C班' }
        ];

        // 当前登录用户
        let currentUser = null;

        // DOM元素
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        const loginForm = document.getElementById('loginForm');
        const runForm = document.getElementById('runForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginMessage = document.getElementById('loginMessage');
        const dashboardMessage = document.getElementById('dashboardMessage');

        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 检查是否有保存的登录状态
            const savedUser = localStorage.getItem('runUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showDashboard();
            }
            
            // 设置日期默认值
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('runDate').value = today;
            document.getElementById('runDate').max = today;
            
            // 绑定事件
            loginForm.addEventListener('submit', handleLogin);
            runForm.addEventListener('submit', handleRunSubmit);
            logoutBtn.addEventListener('click', handleLogout);
        });

        // 处理登录
        function handleLogin(e) {
            e.preventDefault();
            
            const studentId = document.getElementById('studentId').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!studentId || !password) {
                showMessage(loginMessage, '请输入学号和密码', 'error');
                return;
            }
            
            // 查找用户
            const user = users.find(u => u.id === studentId && u.password === password);
            
            if (user) {
                currentUser = user;
                
                // 保存登录状态到本地存储
                localStorage.setItem('runUser', JSON.stringify(user));
                
                // 显示成功消息
                showMessage(loginMessage, '登录成功！正在跳转...', 'success');
                
                // 延迟跳转到打卡页面
                setTimeout(() => {
                    showDashboard();
                }, 1000);
            } else {
                showMessage(loginMessage, '学号或密码错误，请使用演示账号', 'error');
            }
        }

        // 显示消息
        function showMessage(element, text, type) {
            element.textContent = text;
            element.className = `message ${type}`;
            
            setTimeout(() => {
                element.textContent = '';
                element.className = 'message';
            }, 3000);
        }

        // 显示打卡页面
        function showDashboard() {
            // 更新用户信息
            document.getElementById('userName').textContent = currentUser.name;
            document.getElementById('userClass').textContent = currentUser.class;
            document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);
            document.getElementById('dashboardStudentId').value = currentUser.id;
            
            // 切换页面
            loginPage.style.display = 'none';
            dashboardPage.style.display = 'block';
            
            // 加载用户数据
            loadUserData();
        }

        // 退出登录
        function handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                currentUser = null;
                localStorage.removeItem('runUser');
                
                // 重置表单
                loginForm.reset();
                
                // 切换回登录页面
                dashboardPage.style.display = 'none';
                loginPage.style.display = 'block';
                
                showMessage(loginMessage, '已退出登录', 'success');
            }
        }

        // 提交跑步打卡
        function handleRunSubmit(e) {
            e.preventDefault();
            
            const runDate = document.getElementById('runDate').value;
            const runTime = document.getElementById('runTime').value;
            const distance = parseFloat(document.getElementById('distance').value);
            const duration = parseInt(document.getElementById('duration').value);
            const runType = document.getElementById('runType').value;
            const location = document.getElementById('location').value.trim();
            const notes = document.getElementById('notes').value.trim();
            
            // 验证输入
            if (!runDate || !runTime || !distance || !duration || !runType) {
                showMessage(dashboardMessage, '请填写所有必填项', 'error');
                return;
            }
            
            // 创建打卡记录
            const record = {
                id: Date.now(),
                date: runDate,
                time: runTime,
                distance: distance,
                duration: duration,
                type: runType,
                location: location || '未指定',
                notes: notes || '无',
                timestamp: new Date().toISOString()
            };
            
            // 保存记录
            saveRunRecord(record);
            
            // 重置表单
            document.getElementById('distance').value = '';
            document.getElementById('duration').value = '';
            document.getElementById('notes').value = '';
            document.getElementById('location').value = '';
            
            // 显示成功消息
            showMessage(dashboardMessage, `打卡成功！已记录${distance}km的${runType}`, 'success');
            
            // 重新加载数据
            loadUserData();
        }

        // 保存跑步记录
        function saveRunRecord(record) {
            const records = JSON.parse(localStorage.getItem(`runRecords_${currentUser.id}`) || '[]');
            records.push(record);
            localStorage.setItem(`runRecords_${currentUser.id}`, JSON.stringify(records));
        }

        // 加载用户数据
        function loadUserData() {
            // 获取所有记录
            const records = JSON.parse(localStorage.getItem(`runRecords_${currentUser.id}`) || '[]');
            
            // 获取今天的日期
            const today = new Date().toISOString().split('T')[0];
            
            // 筛选今天的记录
            const todayRecords = records.filter(r => r.date === today);
            
            // 计算统计数据
            const todayRuns = todayRecords.length;
            const todayDistance = todayRecords.reduce((sum, r) => sum + r.distance, 0);
            const todayTime = todayRecords.reduce((sum, r) => sum + r.duration, 0);
            
            // 更新统计显示
            document.getElementById('todayRuns').textContent = todayRuns;
            document.getElementById('todayDistance').textContent = todayDistance.toFixed(1);
            document.getElementById('todayTime').textContent = todayTime;
            
            // 显示记录列表
            displayRecords(records);
        }

        // 显示打卡记录
        function displayRecords(records) {
            const container = document.getElementById('recordsContainer');
            
            if (records.length === 0) {
                container.innerHTML = `
                    <div class="no-records">
                        <i class="fas fa-clipboard-list"></i>
                        <p>暂无打卡记录，开始第一次跑步吧！</p>
                    </div>
                `;
                return;
            }
            
            // 按日期倒序排序
            records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            container.innerHTML = records.map(record => `
                <div class="record-item">
                    <div class="record-header">
                        <div class="record-date">
                            ${record.date} ${record.time}
                        </div>
                        <div class="record-type">${record.type}</div>
                    </div>
                    <div class="record-details">
                        <div><span>距离:</span> ${record.distance}km</div>
                        <div><span>时长:</span> ${record.duration}分钟</div>
                        <div><span>地点:</span> ${record.location}</div>
                        <div><span>备注:</span> ${record.notes}</div>
                    </div>
                </div>
            `).join('');
        }

        // 添加演示数据（首次访问时）
        if (!localStorage.getItem('demoLoaded')) {
            // 为每个用户添加演示数据
            users.forEach(user => {
                const demoRecords = [
                    {
                        id: 1,
                        date: new Date().toISOString().split('T')[0],
                        time: '07:30',
                        distance: 3.5,
                        duration: 25,
                        type: '晨跑',
                        location: '学校操场',
                        notes: '早晨空气清新',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 2,
                        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                        time: '18:45',
                        distance: 4.2,
                        duration: 30,
                        type: '夜跑',
                        location: '校园环路',
                        notes: '夜晚凉爽',
                        timestamp: new Date(Date.now() - 86400000).toISOString()
                    }
                ];
                
                localStorage.setItem(`runRecords_${user.id}`, JSON.stringify(demoRecords));
            });
            
            localStorage.setItem('demoLoaded', 'true');}
