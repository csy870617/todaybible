document.addEventListener('DOMContentLoaded', () => {
    // ⚠️ [중요] 카카오 개발자 사이트(developers.kakao.com)에서 발급받은 'JavaScript 키'를 여기에 입력하세요.
    // 키를 입력하지 않으면 자동으로 2순위(기본 공유)로 넘어갑니다.
    const KAKAO_API_KEY = '여기에_발급받은_자바스크립트_키를_넣으세요'; 

    // 카카오 SDK 초기화
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            try {
                Kakao.init(KAKAO_API_KEY);
            } catch (e) {
                console.log('카카오 키가 설정되지 않았습니다.');
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

    const totalCards = 105;
    let currentCardUrl = "";

    function showPage(page) {
        [landingPage, loadingPage, resultPage].forEach(p => p.classList.remove('active'));
        window.scrollTo(0, 0);
        setTimeout(() => page.classList.add('active'), 50);
    }

    // 1. 말씀 뽑기
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

    // 4. 공유하기 (카톡 -> 기본공유 -> 복사)
    btnShare.addEventListener('click', async () => {
        const shareData = {
            title: '2026 새해를 여는 하나님의 말씀',
            text: '새해 저에게 주신 말씀을 확인해보세요.',
            url: window.location.href,
        };

        // 이미지의 전체 URL 생성 (카카오 공유용)
        // 주의: 로컬(내 컴퓨터)에서는 작동 안 함. 실제 웹호스팅 서버에 올려야 작동.
        const fullImageUrl = new URL(currentCardUrl, window.location.href).href;

        // [1단계] 카카오톡 공유 시도
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
            try {
                Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: shareData.title,
                        description: shareData.text,
                        imageUrl: fullImageUrl, // 뽑은 카드 이미지를 썸네일로 표시
                        link: {
                            mobileWebUrl: shareData.url,
                            webUrl: shareData.url,
                        },
                    },
                    buttons: [
                        {
                            title: '말씀 확인하기',
                            link: {
                                mobileWebUrl: shareData.url,
                                webUrl: shareData.url,
                            },
                        },
                    ],
                });
                return; // 카카오톡 공유 성공 시 종료
            } catch (err) {
                console.log('카카오 공유 실패, 다음 단계로 이동');
            }
        }

        // [2단계] 기본 공유(Navigator Share) 시도
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return; // 공유 성공 시 종료
            } catch (err) {
                // 사용자가 취소했거나 에러 발생 시 다음 단계로
            }
        }

        // [3단계] 클립보드 복사 (최후의 수단)
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('주소가 복사되었습니다! 원하시는 곳에 붙여넣기 하세요.');
        } catch (err) {
            alert('주소 복사에 실패했습니다.');
        }
    });
});