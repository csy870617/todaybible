document.addEventListener('DOMContentLoaded', () => {
    const KAKAO_API_KEY = '6c23c364b1865ae078131725d071c841'; 
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            try { Kakao.init(KAKAO_API_KEY); } catch (e) {}
        }
    }

    const landingPage = document.getElementById('page-landing');
    const loadingPage = document.getElementById('page-loading');
    const resultPage = document.getElementById('page-result');
    const btnDraw = document.getElementById('btn-draw');
    const btnRetry = document.getElementById('btn-retry');
    const btnDownload = document.getElementById('btn-download');
    const btnShare = document.getElementById('btn-share');
    const resultImg = document.getElementById('result-img');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenImg = document.getElementById('fullscreen-img');

    const totalCards = 105;
    let currentCardUrl = "";

    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        page.classList.add('active');
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // 1. 뽑기
    btnDraw.addEventListener('click', () => {
        showPage(loadingPage);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * totalCards) + 1;
            const formattedNum = String(randomIndex).padStart(3, '0');
            currentCardUrl = `cards/${formattedNum}.JPG`; 
            
            const imgLoader = new Image();
            imgLoader.src = currentCardUrl;
            imgLoader.onload = () => {
                resultImg.src = currentCardUrl;
                showPage(resultPage);
            };
            imgLoader.onerror = () => {
                alert(`이미지를 찾을 수 없습니다.\n경로: ${currentCardUrl}`);
                showPage(landingPage);
            }
        }, 2000); 
    });

    // 2. 다시 뽑기
    btnRetry.addEventListener('click', () => {
        resultImg.src = "";
        showPage(landingPage);
    });

    // 3. 저장하기
    btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = currentCardUrl;
        link.download = `2026_새해말씀.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 4. 공유하기 (수정됨: 이미지 + 문구 + URL)
    btnShare.addEventListener('click', async () => {
        const shareTitle = '2026 새해를 여는 하나님의 말씀';
        const shareUrl = window.location.href;
        
        // ✅ 문구와 URL을 합칩니다 (가장 확실한 방법)
        const shareText = '당신의 2026년 새해를 여는 말씀은 무엇인가요?\n' + shareUrl;

        try {
            const response = await fetch(currentCardUrl);
            const blob = await response.blob();
            const file = new File([blob], '2026_word.jpg', { type: 'image/jpeg' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: shareTitle,
                    text: shareText, // 여기에 URL이 포함됨
                });
                return;
            }
        } catch (error) {
            console.log('파일 공유 불가, 대체 수단 실행');
        }

        // 카카오톡 공유
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                const fullImageUrl = new URL(currentCardUrl, window.location.href).href;
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareTitle,
                        description: '당신의 2026년 새해를 여는 말씀은 무엇인가요?', // 카톡은 URL 버튼이 따로 있어서 문구만
                        imageUrl: fullImageUrl,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                    buttons: [{ title: '말씀 뽑기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
                });
                return;
            } catch (err) {}
        }

        // 클립보드 복사
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('주소가 복사되었습니다.\n당신의 2026년 새해를 여는 말씀은 무엇인가요?');
        } catch (err) {
            alert('공유할 수 없습니다.');
        }
    });

    // 전체화면 기능
    resultImg.addEventListener('click', () => {
        fullscreenImg.src = currentCardUrl;
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    fullscreenModal.addEventListener('click', () => {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});