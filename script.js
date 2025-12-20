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

    // DOM 요소 선택
    const landingPage = document.getElementById('page-landing');
    const loadingPage = document.getElementById('page-loading');
    const resultPage = document.getElementById('page-result');
    
    const btnDraw = document.getElementById('btn-draw');
    const btnRetry = document.getElementById('btn-retry');
    
    // ✅ 버튼 ID 변경됨
    const btnSendCard = document.getElementById('btn-send-card');   // 말씀 보내기 (이미지)
    const btnShareSite = document.getElementById('btn-share-site'); // 사이트 공유 (링크)
    
    const resultImg = document.getElementById('result-img');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenImg = document.getElementById('fullscreen-img');
    const envelopeArea = document.querySelector('.card-area'); 

    const totalCards = 105;
    let currentCardUrl = "";

    // 화면 전환 함수
    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        page.classList.add('active');
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // 뽑기 시작 함수
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

    // 이벤트 연결 (뽑기)
    btnDraw.addEventListener('click', startDrawAction);
    envelopeArea.addEventListener('click', startDrawAction); 

    // ✅ [버튼 2] '다른 말씀' (처음으로)
    btnRetry.addEventListener('click', () => {
        resultImg.src = "";
        const envelope = document.querySelector('.card-3d');
        if (envelope) envelope.classList.remove('open');
        showPage(landingPage);
    });

    // ✅ [버튼 1] '말씀 보내기' (이미지 파일 공유)
    btnSendCard.addEventListener('click', async () => {
        try {
            // 이미지를 Fetch해서 Blob으로 변환
            const response = await fetch(currentCardUrl);
            const blob = await response.blob();
            const file = new File([blob], "2026_새해말씀.jpg", { type: "image/jpeg" });

            // 모바일 네이티브 공유 (파일 공유) 시도
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: '2026 말씀카드',
                    text: '나를 위한 하나님의 말씀이 도착했습니다.',
                });
            } else {
                // PC 등 파일 공유 미지원 시 -> 다운로드로 대체
                throw new Error("파일 공유 미지원");
            }
        } catch (e) {
            // 실패 시 다운로드 진행
            const link = document.createElement('a');
            link.href = currentCardUrl;
            link.download = `2026_새해말씀.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // ✅ [버튼 3] '2026 말씀카드뽑기 공유' (사이트 링크 공유)
    btnShareSite.addEventListener('click', async () => {
        const shareUrl = window.location.href;

        // [1단계] 모바일 네이티브 공유 (URL)
        if (navigator.share) {
            try {
                await navigator.share({ url: shareUrl });
                return;
            } catch (err) {
                console.log('네이티브 공유 취소/실패');
            }
        }

        // [2단계] 카카오톡 SDK 공유
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                const thumbUrl = new URL('thumbnail_4.png', SITE_URL).href;

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

    // 전체화면 & 뒤로가기 로직
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