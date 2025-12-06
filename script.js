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

    const totalCards = 105;
    let currentCardUrl = "";

    // 화면 전환 함수
    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        page.classList.add('active');
        
        // 페이지 전환 시 모달이 켜져있다면 닫기
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

    // 4. 공유하기
    btnShare.addEventListener('click', async () => {
        // ✅ 문구 수정됨
        const shareText = '당신의 말씀은 무엇인가요?';
        const shareUrl = window.location.href;
        const finalShareText = `${shareText}\n${shareUrl}`;

        // [1단계] 모바일 기본 공유
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '2026 새해를 여는 하나님의 말씀',
                    text: shareText,
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
                const logoUrl = new URL('logo.png', SITE_URL).href;
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareText, 
                        description: '카드를 눌러 말씀을 확인해보세요.',
                        imageUrl: logoUrl,
                        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                    },
                    buttons: [{ title: '말씀 확인하기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
                });
                return;
            } catch (err) {}
        }

        // [3단계] 클립보드 복사
        try {
            await navigator.clipboard.writeText(finalShareText);
            alert('주소가 복사되었습니다.\n원하시는 곳에 붙여넣기 하세요.');
        } catch (err) {
            alert('공유 기능을 사용할 수 없습니다.');
        }
    });

    // =========================================
    // ✅ 전체화면 & 뒤로가기 제어 로직
    // =========================================

    const closeModal = () => {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    // 1. 이미지 클릭 시 -> 열기 + 히스토리 추가
    resultImg.addEventListener('click', () => {
        fullscreenImg.src = currentCardUrl;
        fullscreenModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        history.pushState({ modal: true }, null, "");
    });

    // 2. 모달 클릭 시 -> 닫기 (뒤로가기 실행)
    fullscreenModal.addEventListener('click', () => {
        history.back();
    });

    // 3. 뒤로가기 감지
    window.addEventListener('popstate', () => {
        if (fullscreenModal.classList.contains('active')) {
            closeModal();
        }
    });
});