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
    
    // ✅ 버튼 ID 변경 (저장 버튼, 공유 버튼)
    const btnSaveImg = document.getElementById('btn-save-img'); 
    const btnShareSite = document.getElementById('btn-share-site'); 
    
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
        if(!envelope || envelope.classList.contains('open')) return;

        envelope.classList.add('open');

        setTimeout(() => {
            showPage(loadingPage);
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * totalCards) + 1;
                const formattedNum = String(randomIndex).padStart(3, '0');
                const cardUrl = `cards/${formattedNum}.JPG`;

                const imgLoader = new Image();
                let settled = false;

                const failLoad = () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(loadTimer);
                    alert('이미지를 불러오지 못했습니다.\n네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
                    envelope.classList.remove('open');
                    showPage(landingPage);
                };
                const loadTimer = setTimeout(failLoad, 15000);

                imgLoader.onload = () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(loadTimer);
                    currentCardUrl = cardUrl;
                    resultImg.src = cardUrl;
                    showPage(resultPage);
                };
                imgLoader.onerror = failLoad;
                imgLoader.src = cardUrl;
            }, 2000);
        }, 800);
    };

    btnDraw.addEventListener('click', startDrawAction);
    envelopeArea.addEventListener('click', startDrawAction); 

    // ✅ [버튼 2] 다른 말씀 (처음으로)
    btnRetry.addEventListener('click', () => {
        resultImg.src = "";
        const envelope = document.querySelector('.card-3d');
        if (envelope) envelope.classList.remove('open');
        showPage(landingPage);
    });

    // ✅ [버튼 1] 말씀 저장 (단순 다운로드 기능)
    btnSaveImg.addEventListener('click', () => {
        if (!currentCardUrl) return;
        const link = document.createElement('a');
        link.href = currentCardUrl;
        link.download = `2026_오늘의 말씀.jpg`; // 다운로드될 파일명
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // ✅ [버튼 3] 친구에게 공유하기 (사이트 링크 공유)
    btnShareSite.addEventListener('click', async () => {
        const shareUrl = window.location.href;

        // [1단계] 모바일 네이티브 공유
        if (navigator.share) {
            try {
                await navigator.share({ url: shareUrl });
                return;
            } catch (err) {
                // 사용자가 공유 창을 직접 닫은 경우, 다른 공유 수단으로 넘어가지 않음
                if (err && err.name === 'AbortError') return;
            }
        }

        // [2단계] 카카오톡 SDK 공유
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized() && Kakao.Share) {
            try {
                const thumbUrl = new URL('thumbnail_5.png', SITE_URL).href;

                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: ' ', 
                        description: ' ',
                        imageUrl: thumbUrl,
                        imageWidth: 1280,
                        imageHeight: 720,
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

    // 전체화면 기능
    const closeModal = () => {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    resultImg.addEventListener('click', () => {
        if (!currentCardUrl) return;
        fullscreenImg.src = currentCardUrl;
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        try { history.pushState({ modal: true }, "", ""); } catch (e) {}
    });

    fullscreenModal.addEventListener('click', () => {
        // pushState가 실패한 환경에서는 history.back()이 페이지 이탈로 이어지므로 직접 닫음
        if (history.state && history.state.modal) {
            history.back();
        } else {
            closeModal();
        }
    });

    window.addEventListener('popstate', () => {
        if (fullscreenModal.classList.contains('active')) {
            closeModal();
        }
    });

});

