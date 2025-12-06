document.addEventListener('DOMContentLoaded', () => {
    // ✅ 사용자 님의 카카오 자바스크립트 키 적용 완료
    const KAKAO_API_KEY = '6c23c364b1865ae078131725d071c841'; 

    // 카카오 SDK 초기화
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            try {
                Kakao.init(KAKAO_API_KEY);
                console.log('Kakao SDK Initialized');
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

    // 1. 뽑기
    btnDraw.addEventListener('click', () => {
        showPage(loadingPage);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * totalCards) + 1;
            currentCardUrl = `cards/bible_card (${randomIndex}).jpg`;
            
            const imgLoader = new Image();
            imgLoader.src = currentCardUrl;
            imgLoader.onload = () => {
                resultImg.src = currentCardUrl;
                showPage(resultPage);
            };
            imgLoader.onerror = () => {
                alert("이미지를 불러올 수 없습니다.");
                showPage(landingPage);
            }
        }, 2000); 
    });

    // 2. 다시 뽑기
    btnRetry.addEventListener('click', () => {
        resultImg.src = "";
        showPage(landingPage);
    });

    // 3. 저장하기 (원본 화질)
    btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = currentCardUrl;
        link.download = `2026_새해말씀.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 4. 공유하기 (카톡 -> 기본 -> 복사)
    btnShare.addEventListener('click', async () => {
        const shareData = {
            title: '2026 새해를 여는 하나님의 말씀',
            text: '새해 저에게 주신 말씀을 확인해보세요.',
            url: window.location.href,
        };

        // 절대 경로 변환 (카카오 공유용)
        const fullImageUrl = new URL(currentCardUrl, window.location.href).href;

        // [1순위] 카카오톡 공유
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareData.title,
                        description: shareData.text,
                        imageUrl: fullImageUrl, // 뽑은 카드 이미지를 썸네일로
                        link: {
                            mobileWebUrl: shareData.url,
                            webUrl: shareData.url,
                        },
                    },
                    buttons: [
                        {
                            title: '말씀 뽑으러 가기',
                            link: {
                                mobileWebUrl: shareData.url,
                                webUrl: shareData.url,
                            },
                        },
                    ],
                });
                return; // 성공 시 종료
            } catch (err) {
                console.log('카카오 공유 실패, 다음 단계로...');
            }
        }

        // [2순위] 기본 공유창
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (err) {
                // 취소 혹은 실패 시 다음 단계로
            }
        }

        // [3순위] 클립보드 복사
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('주소가 복사되었습니다! 원하시는 곳에 붙여넣기 하세요.');
        } catch (err) {
            alert('주소 복사에 실패했습니다.');
        }
    });
});