document.addEventListener('DOMContentLoaded', () => {
    // 1. 설정
    const KAKAO_API_KEY = '6c23c364b1865ae078131725d071c841'; 
    const SITE_URL = 'https://csy870617.github.io/todaybible/';

    // 2. 카카오 SDK 초기화
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
    const envelopeArea = document.querySelector('.card-area'); 

    const totalCards = 105;
    let currentCardUrl = "";

    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        page.classList.add('active');
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    const startDrawAction = () => {
        const envelope = document.querySelector('.card-3d');
        if(envelope.classList.contains('open')) return;

        envelope.classList.add('open'); 

        setTimeout(() => {
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
        }, 800); 
    };

    // 이벤트 연결
    btnDraw.addEventListener('click', startDrawAction);
    envelopeArea.addEventListener('click', startDrawAction); 

    // 다시 뽑기
    btnRetry.addEventListener('click', () => {
        resultImg.src = "";
        const envelope = document.querySelector('.card-3d');
        if (envelope) envelope.classList.remove('open');
        showPage(landingPage);
    });

    // 저장하기
    btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = currentCardUrl;
        link.download = `2026_새해말씀.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 공유하기
    btnShare.addEventListener('click', async () => {
        const shareUrl = window.location.href;

        // [1단계] 모바일 기본 공유
        if (navigator.share) {
            try {
                await navigator.share({
                    url: shareUrl, 
                });
                return;
            } catch (err) {
                console.log('네이티브 공유 취소/실패');
            }
        }

        // [2단계] 카카오톡 SDK 공유
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                // ✅ [수정됨] 썸네일 이미지: thumbnail_3.png
                const thumbUrl = new URL('thumbnail_3.png', SITE_URL).href;

                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: ' ', 
                        description: ' ',
                        imageUrl: thumbUrl,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                });
                return;
            } catch (err) {}
        }

        // [3단계] 클립보드 복사
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('주소가 복사되었습니다.');
        } catch (err) {
            alert('공유 기능을 사용할 수 없습니다.');
        }
    });

    // 전체화면 & 뒤로가기
    const closeModal = () => {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    resultImg.addEventListener('click', () => {
        fullscreenImg.src = currentCardUrl;
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        history.pushState({ modal: true }, null, "");
    });

    fullscreenModal.addEventListener('click', () => {
        history.back();
    });

    window.addEventListener('popstate', () => {
        if (fullscreenModal.classList.contains('active')) {
            closeModal();
        }
    });
});