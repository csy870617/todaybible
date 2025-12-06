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

    // 3. 저장하기 (원본 이미지 다운로드)
    btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = currentCardUrl;
        link.download = `2026_새해말씀.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 4. 공유하기 (✅ 수정됨: 문구 + 링크만 깔끔하게 공유)
    btnShare.addEventListener('click', async () => {
        const shareTitle = '2026 새해를 여는 하나님의 말씀';
        const shareText = '당신의 2026년 새해를 여는 말씀은 무엇인가요?';
        const shareUrl = window.location.href;

        // --- [1단계] 모바일 기본 공유 (네이티브) ---
        // 카톡, 문자, 인스타DM 등 설치된 앱 목록이 뜹니다.
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
                return; // 공유 성공 시 종료
            } catch (err) {
                // 사용자가 취소했거나 에러 발생 시 다음 단계(카톡 SDK)로 넘어감
                console.log('네이티브 공유 취소/실패');
            }
        }

        // --- [2단계] 카카오톡 SDK 공유 (PC 등 네이티브 공유 불가능할 때) ---
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                // 로고 이미지 경로 (logo.png)
                const logoUrl = new URL('logo.png', SITE_URL).href;

                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareTitle,
                        description: shareText,
                        imageUrl: logoUrl, // 썸네일은 로고로 고정
                        link: {
                            mobileWebUrl: shareUrl,
                            webUrl: shareUrl,
                        },
                    },
                    buttons: [
                        {
                            title: '말씀 뽑기',
                            link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                            },
                        },
                    ],
                });
                return;
            } catch (err) {}
        }

        // --- [3단계] 최후의 수단: 클립보드 복사 ---
        try {
            const textToCopy = `${shareText}\n${shareUrl}`;
            await navigator.clipboard.writeText(textToCopy);
            alert('주소가 복사되었습니다.\n원하시는 곳에 붙여넣기 하세요.');
        } catch (err) {
            alert('공유 기능을 사용할 수 없습니다.');
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