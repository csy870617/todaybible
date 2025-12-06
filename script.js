document.addEventListener('DOMContentLoaded', () => {
    // ✅ 사용자 님의 카카오 자바스크립트 키
    const KAKAO_API_KEY = '6c23c364b1865ae078131725d071c841'; 

    // 카카오 SDK 초기화
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            try {
                Kakao.init(KAKAO_API_KEY);
            } catch (e) {
                console.warn('Kakao SDK Init Failed:', e);
            }
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

    // 카드 총 개수
    const totalCards = 105;
    let currentCardUrl = "";

    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        setTimeout(() => page.classList.add('active'), 50);
    }

    // 1. 뽑기 버튼
    btnDraw.addEventListener('click', () => {
        showPage(loadingPage);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * totalCards) + 1;
            
            // 🚨 [핵심 수정] 숫자를 3자리 문자열로 변환 (예: 1 -> "001", 15 -> "015")
            const formattedNum = String(randomIndex).padStart(3, '0');
            
            // 파일명 규칙 적용: 001.JPG ~ 105.JPG
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
        const shareData = {
            title: '2026 새해를 여는 하나님의 말씀',
            text: '새해 저에게 주신 말씀을 확인해보세요.',
            url: window.location.href,
        };

        const fullImageUrl = new URL(currentCardUrl, window.location.href).href;

        // [1순위] 카카오톡
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareData.title,
                        description: shareData.text,
                        imageUrl: fullImageUrl,
                        link: {
                            mobileWebUrl: shareData.url,
                            webUrl: shareData.url,
                        },
                    },
                    buttons: [{
                        title: '말씀 뽑으러 가기',
                        link: { mobileWebUrl: shareData.url, webUrl: shareData.url },
                    }],
                });
                return;
            } catch (err) {}
        }

        // [2순위] 기본 공유
        if (navigator.share) {
            try { await navigator.share(shareData); return; } catch (err) {}
        }

        // [3순위] 복사
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('주소가 복사되었습니다.');
        } catch (err) {
            alert('주소 복사 실패');
        }
    });
});