document.addEventListener('DOMContentLoaded', () => {
    // --- HẰNG SỐ VÀ BIẾN TOÀN CỤC ---
    const correctBirthday = '08032007'; // !!! THAY ĐỔI NGÀY SINH ĐÚNG
    const BLOW_THRESHOLD = 55;
    const MAX_CANDLES = 3;

    // Các màn hình
    const loginScreen = document.getElementById('login-screen');
    const cakeScreen = document.getElementById('cake-screen');
    const galleryScreen = document.getElementById('gallery-screen');

    // Phần tử màn hình 1
    const passwordDisplay = document.getElementById('password-display');
    const keypad = document.querySelector('.keypad');
    let currentInput = '';

    // Phần tử màn hình 2
    const flames = document.querySelectorAll('.flame');
    const instructionText = document.getElementById('instruction-text');
    const blowArea = document.getElementById('blow-area');
    const birthdaySong = document.getElementById('birthday-song');
    const showWishesButton = document.getElementById('show-wishes-button');
    let candlesBlown = 0;
    let audioContext, micStream, isListening = false;
    let isBlowing = false;

    // --- HÀM CHUYỂN ĐỔI MÀN HÌNH ---
    function switchScreen(from, to) {
        from.classList.remove('active');
        to.classList.add('active');
    }

    // --- LOGIC MÀN HÌNH 1: ĐĂNG NHẬP ---
    keypad.addEventListener('click', (e) => {
        if (!e.target.matches('button.key')) return;
        const key = e.target;
        if (key.id === 'enter-key') {
            if (currentInput === correctBirthday) switchScreen(loginScreen, cakeScreen);
            else {
                passwordDisplay.classList.add('error');
                setTimeout(() => passwordDisplay.classList.remove('error'), 500);
                currentInput = '';
                updatePasswordDisplay();
            }
        } else if (key.id === 'clear-key') {
            currentInput = '';
            updatePasswordDisplay();
        } else if (currentInput.length < 8) {
            currentInput += key.textContent;
            updatePasswordDisplay();
        }
    });

    function updatePasswordDisplay() {
        passwordDisplay.textContent = '●'.repeat(currentInput.length);
    }

    // --- LOGIC MÀN HÌNH 2: BÁNH KEM ---
    blowArea.addEventListener('click', startMicrophoneListener);

    async function startMicrophoneListener() {
        if (isListening || candlesBlown >= MAX_CANDLES) return;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(micStream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            isListening = true;
            instructionText.textContent = 'Thổi mạnh vào mic đi nào!';
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            function monitorMic() {
                if (!isListening) return;
                analyser.getByteFrequencyData(dataArray);
                let avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                if (avg > BLOW_THRESHOLD) blowOutCandle();
                requestAnimationFrame(monitorMic);
            }
            monitorMic();
        } catch (err) {
            instructionText.textContent = 'Không có mic? Nhấn vào nến để thổi!';
            flames.forEach(f => {
                if (!f.classList.contains('blown-out')) f.addEventListener('click', blowOutCandle, { once: true });
            });
        }
    }

    function blowOutCandle() {
        if (isBlowing || candlesBlown >= MAX_CANDLES) return;
        isBlowing = true;
        flames[candlesBlown].classList.add('blown-out');
        candlesBlown++;
        if (candlesBlown < MAX_CANDLES) {
            instructionText.textContent = `Tuyệt! Còn ${MAX_CANDLES - candlesBlown} nến nữa!`;
        } else {
            instructionText.textContent = '🎉 CHÚC MỪNG SINH NHẬT! 🎉';
            if (isListening) micStream.getTracks().forEach(t => t.stop());
            triggerCelebration();
        }
        setTimeout(() => { isBlowing = false; }, 500);
    }

    function triggerCelebration() {
        playCelebrationMusic();
        blowArea.style.display = 'none';
        showWishesButton.classList.remove('hidden');
    }

    showWishesButton.addEventListener('click', () => {
        switchScreen(cakeScreen, galleryScreen);
        startGalleryAnimation();
    });

    // --- LOGIC MÀN HÌNH 3: THƯ VIỆN ẢNH BAY LIÊN TỤC ---
function startGalleryAnimation() {
    const photoContainer = document.querySelector('.flying-photos-bg');
    const wishes = document.querySelector('.wishes');

    // !!! THÊM TÊN CÁC FILE ẢNH CỦA BẠN VÀO ĐÂY !!!
    const photoSources = [
        'anhquynhbeo.jpg', // Giả sử đây là 1 ảnh
        'quynhdthw1.jpg',
        'quynhdthw2.jpg',
        'quynhdthw5.jpg',
        'quynhdthw6.jpg',
        'quynhdthw7.jpg',
        'quynhdthw8.jpg',
        'quynhdthw9.jpg',
        // Thêm các ảnh khác nếu có
    ];

    // Hàm tạo một ảnh bay
    function createFlyingPhoto() {
        // 1. Tạo các phần tử
        const photoWrapper = document.createElement('div');
        photoWrapper.classList.add('flying-photo');
        const img = document.createElement('img');
        
        // 2. Lấy ảnh ngẫu nhiên từ danh sách
        img.src = photoSources[Math.floor(Math.random() * photoSources.length)];
        
        // 3. Đặt các thuộc tính ngẫu nhiên
        photoWrapper.style.top = (Math.random() * 90) + 'vh'; // Vị trí dọc ngẫu nhiên
        photoWrapper.style.width = (Math.random() * 100 + 100) + 'px'; // Kích thước ngẫu nhiên
        photoWrapper.style.animationDuration = (Math.random() * 8 + 8) + 's'; // Tốc độ bay ngẫu nhiên
        photoWrapper.style.animationDelay = (Math.random() * -5) + 's'; // Thời gian trễ ngẫu nhiên (có cả số âm để lúc đầu đã có ảnh)
        photoWrapper.style.transform = `rotate(${(Math.random() * 40) - 20}deg)`; // Độ xoay ngẫu nhiên
        
        // 4. Gắn ảnh vào và thêm vào container
        photoWrapper.appendChild(img);
        photoContainer.appendChild(photoWrapper);

        // 5. Tự hủy sau khi bay xong để không làm chậm web
        setTimeout(() => {
            photoWrapper.remove();
        }, 16000); // Thời gian này phải lớn hơn animationDuration
    }

    // Tạo nhiều ảnh lúc đầu
    for (let i = 0; i < 15; i++) {
        createFlyingPhoto();
    }

    // Cứ mỗi 1 giây lại tạo thêm 1 ảnh mới
    setInterval(createFlyingPhoto, 1000);

    // Sau 2 giây, hiện lời chúc lên
    setTimeout(() => {
        wishes.classList.add('visible');
    }, 2000);
}
    const heartsContainer = document.querySelector('.hearts-container');

    function createHeart() {
        if (!heartsContainer) return;

        const heart = document.createElement('div');
        heart.classList.add('heart');
        
        // Đặt vị trí và thuộc tính ngẫu nhiên
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's'; // Bay trong 5-10 giây
        heart.style.transform = `rotate(-45deg) scale(${Math.random() * 0.5 + 0.5})`; // Xoay và có kích thước ngẫu nhiên

        heartsContainer.appendChild(heart);

        // Xóa trái tim sau khi bay xong để không làm chậm web
        setTimeout(() => {
            heart.remove();
        }, 10000); // 10 giây
    }

    // Cứ mỗi 300ms (0.3 giây) thì tạo 1 trái tim mới
    setInterval(createHeart, 300);

    function playCelebrationMusic() {
        birthdayMusic.currentTime = 0;
        const playPromise = birthdayMusic.play();
        if (playPromise) {
            playPromise.catch(err => console.warn('Không thể tự động phát nhạc:', err));
        }
    }

    function toggleMusic() {
        if (birthdayMusic.paused) {
            birthdayMusic.play();
            if (musicToggleBtn) musicToggleBtn.textContent = '⏹️ Dừng nhạc';
        } else {
            birthdayMusic.pause();
            if (musicToggleBtn) musicToggleBtn.textContent = '🎵 Phát nhạc';
        }
    }
    
    function setInstruction(text) {
        if (instructionEl) instructionEl.textContent = text;
    }
    
    function updateMicLevelBar(average) {
        if (micLevelBar) {
            micLevelBar.style.width = Math.min(average * 2, 100) + '%';
        }
    }
}); 