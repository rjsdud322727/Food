let map;
let marker;
let geocoder;
let recentSearches = []; // 최근 검색 기록을 저장할 배열

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRecentLocations();

    const searchKoreanBtn = document.getElementById('searchKorean');
    const searchChineseBtn = document.getElementById('searchChinese');
    const searchJapaneseBtn = document.getElementById('searchJapanese');
    const searchBurgerBtn = document.getElementById('searchBurger');
    const searchChickenBtn = document.getElementById('searchChicken');
    const searchPizzaBtn = document.getElementById('searchPizza');
    const searchSnackBtn = document.getElementById('searchSnack');
    const searchCafeBtn = document.getElementById('searchCafe');

    // 각 음식 카테고리 버튼에 클릭 이벤트 추가
    if (searchKoreanBtn) {
        searchKoreanBtn.addEventListener('click', () => {
            console.log('한식 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchKorean();
        });
    }

    if (searchChineseBtn) {
        searchChineseBtn.addEventListener('click', () => {
            console.log('중식 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchChinese();
        });
    }

    if (searchJapaneseBtn) {
        searchJapaneseBtn.addEventListener('click', () => {
            console.log('일식 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchJapanese();
        });
    }

    if (searchBurgerBtn) {
        searchBurgerBtn.addEventListener('click', () => {
            console.log('햄버거 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchBurger();
        });
    }

    if (searchChickenBtn) {
        searchChickenBtn.addEventListener('click', () => {
            console.log('치킨 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchChicken();
        });
    }

    if (searchPizzaBtn) {
        searchPizzaBtn.addEventListener('click', () => {
            console.log('피자 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchPizza();
        });
    }

    if (searchSnackBtn) {
        searchSnackBtn.addEventListener('click', () => {
            console.log('분식 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchSnack();
        });
    }

    if (searchCafeBtn) {
        searchCafeBtn.addEventListener('click', () => {
            console.log('카페/디저트 이미지 클릭됨');
            document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
            getCurrentPositionAndSearchCafe();
        });
    }

    const locationBtn = document.querySelector('.location-btn');
    const addressModal = document.getElementById('addressModal');
    const mapModal = document.getElementById('mapModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const backBtns = document.querySelectorAll('.back-btn');
    const currentLocationBtn = document.querySelector('.current-location-btn');
    const addressInputModal = document.getElementById('addressInputModal');

    locationBtn.addEventListener('click', () => {
        console.log('위치 버튼 클릭됨');
        addressModal.style.display = 'block';
        modalOverlay.style.display = 'block';
    });

    currentLocationBtn.addEventListener('click', function() {
        const addressModal = document.getElementById('addressModal');
        const mapModal = document.getElementById('mapModal');

        addressModal.style.display = 'none'; // 주소 모달 닫기
        mapModal.style.display = 'block'; // 지도 모달 열기
        initializeMap(); // 지도 초기화
    });

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('뒤로가기 버튼 클릭됨');
            closeAllModals();
        });
    });

    document.querySelector('.confirm-location-btn').addEventListener('click', function() {
        const geocoder = new kakao.maps.services.Geocoder();
        const center = map.getCenter();
        
        const lng = center.getLng();
        const lat = center.getLat();
        console.log('좌표:', { lng, lat });

        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                document.getElementById('baseAddress').textContent = address;
                
                document.getElementById('mapModal').style.display = 'none';
                addressInputModal.style.display = 'block';
                
                const saveBtn = addressInputModal.querySelector('.save-btn');
                saveBtn.onclick = function() {
                    const detailAddress = document.getElementById('detailAddress').value;
                    if (!detailAddress) {
                        alert('상세 주소를 입력해주세요');
                        return;
                    }
                    
                    const addressData = {
                        baseAddress: address,
                        detailAddress: detailAddress,
                        lat: lat,
                        lng: lng
                    };
                    
                    saveRecentLocation(addressData);
                    updateLocationButton(addressData);
                    closeAllModals();
                };
                
                const cancelBtn = addressInputModal.querySelector('.cancel-btn');
                cancelBtn.onclick = closeAllModals;
            } else {
                console.error('주소 변환 실패:', status);
                alert('주소 변환에 실패했습니다. 다시 시도해 주세요.');
            }
        });
    });

    // 초기 드 시 식당 목록을 비워둡니다.
    const restaurantList = document.getElementById('restaurantList');
    restaurantList.innerHTML = ''; // 초기에는 아무것도 표시하지 않음

    // 검색창 이벤트 리스너 추가
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchQuery = this.value.trim();
            if (searchQuery) {
                searchByKeyword(searchQuery);
                // 검색 후 입력창 비우기
                this.value = '';
            }
        }
    });

    // 챗봇 관련 요소 추가
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotModal = document.getElementById('chatbotModal');
    const closeChatbot = document.getElementById('closeChatbot');
    const userInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // 챗봇 열기
    chatbotButton.addEventListener('click', () => {
        chatbotModal.classList.add('show'); // 모달을 보이게 함
        addMessage('안녕하세요! 배달 도우미입니다. 무엇을 도와드릴까요?', 'bot');
        userInput.focus();
    });

    // 챗봇 닫기
    closeChatbot.addEventListener('click', () => {
        chatbotModal.classList.remove('show'); // 모달을 숨김
    });

    // 사용자 입력 처리
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    sendMessageBtn.addEventListener('click', sendMessage);

    // 메시지 추가
    function addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // 스크롤을 맨 아래로
    }

    // 메시지 처리
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            processMessage(message);
            userInput.value = ''; // 입력 필드 비우기
        }
    }

    // 메시지 처리
    function processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // "주변에 [음식] 집 알려줘" 패턴 처리
        const match = lowerMessage.match(/주변에 (.+?) 집 알려줘/);
        if (match) {
            const foodType = match[1]; // 음식 종류 추출
            handleFoodRequest(foodType);
            return; // 메시지 처리 종료
        }

        // 기존 음식 카테고리 키워드 매칭
        if (lowerMessage.includes('한식')) {
            addMessage('주변 한식당을 검색합니다.', 'bot');
            getCurrentPositionAndSearchKorean();
        } else if (lowerMessage.includes('중식')) {
            addMessage('주변 중식당을 검색합니다.', 'bot');
            getCurrentPositionAndSearchChinese();
        } else if (lowerMessage.includes('일식')) {
            addMessage('주변 일식당을 검색합니다.', 'bot');
            getCurrentPositionAndSearchJapanese();
        } else if (lowerMessage.includes('햄버거')) {
            addMessage('주변 햄버거 가게를 검색합니다.', 'bot');
            getCurrentPositionAndSearchBurger();
        } else if (lowerMessage.includes('치킨')) {
            addMessage('주변 치킨집을 검색합니다.', 'bot');
            getCurrentPositionAndSearchChicken();
        } else if (lowerMessage.includes('피자')) {
            addMessage('주변 피자집을 검색합니다.', 'bot');
            getCurrentPositionAndSearchPizza();
        } else if (lowerMessage.includes('분식')) {
            addMessage('주변 분식집을 검색합니다.', 'bot');
            getCurrentPositionAndSearchSnack();
        } else if (lowerMessage.includes('카페')) {
            addMessage('주변 카페를 검색합니다.', 'bot');
            getCurrentPositionAndSearchCafe();
        } else if (lowerMessage.includes('날씨')) {
            getWeather(); // 날씨 정보 요청
        } else if (lowerMessage.includes('최근 검색한 음식점')) {
            showRecentSearches(); // 최근 검색 기록 보여주기
        } else if (lowerMessage.includes('도움말')) {
            showHelp(); // 도움말 표시
        } else {
            addMessage('죄송합니다. 잘 이해하지 못했습니다. "도움말"을 입력하시면 사용 가능한 명령어를 보여드립니다.', 'bot');
        }
    }

    // 음식 요청 처리 함수
    function handleFoodRequest(foodType) {
        switch (foodType) {
            case '한식':
                addMessage('주변 한식당을 검색합니다.', 'bot');
                getCurrentPositionAndSearchKorean();
                addRecentSearch('한식');
                break;
            case '중식':
                addMessage('주변 중식당을 검색합니다.', 'bot');
                getCurrentPositionAndSearchChinese();
                addRecentSearch('중식');
                break;
            case '일식':
                addMessage('주변 일식당을 검색합니다.', 'bot');
                getCurrentPositionAndSearchJapanese();
                addRecentSearch('일식');
                break;
            case '햄버거':
                addMessage('주변 햄버거 가게를 검색합니다.', 'bot');
                getCurrentPositionAndSearchBurger();
                addRecentSearch('햄버거');
                break;
            case '치킨':
                addMessage('주변 치킨집을 검색합니다.', 'bot');
                getCurrentPositionAndSearchChicken();
                addRecentSearch('치킨');
                break;
            case '피자':
                addMessage('주변 피자집을 검색합니다.', 'bot');
                getCurrentPositionAndSearchPizza();
                addRecentSearch('피자');
                break;
            case '분식':
                addMessage('주변 분식집을 검색합니다.', 'bot');
                getCurrentPositionAndSearchSnack();
                addRecentSearch('분식');
                break;
            case '카페':
                addMessage('주변 카페를 검색합니다.', 'bot');
                getCurrentPositionAndSearchCafe();
                addRecentSearch('카페');
                break;
            default:
                addMessage('죄송합니다. 해당 음식 종류는 지원하지 않습니다.', 'bot');
                break;
        }
    }

    // 최근 검색 기록 추가
    function addRecentSearch(restaurant) {
        recentSearches.push(restaurant);
        if (recentSearches.length > 5) {
            recentSearches.shift(); // 최대 5개로 제한
        }
    }

    // 최근 검색 기록 보여주기
    function showRecentSearches() {
        if (recentSearches.length > 0) {
            addMessage(`최근 검색한 음식점: ${recentSearches.join(', ')}`, 'bot');
        } else {
            addMessage('최근 검색한 음식점이 없습니다.', 'bot');
        }
    }

    // 날씨 정보 제공
    function getWeather() {
        // 날씨 API 호출 (예: OpenWeatherMap)
        fetch('https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=73f34dc5cc09bf9b7fdd68e33c45c654&units=metric')
            .then(response => {
                if (!response.ok) {
                    throw new Error('API 호출 실패: ' + response.status); // API 호출 실패 시 오류 발생
                }
                return response.json();
            })
            .then(data => {
                if (data.weather && data.weather.length > 0) { // weather 배열이 존재하는지 확인
                    const weather = data.weather[0].description;
                    const temp = data.main.temp;
                    addMessage(`현재 날씨는 ${weather}이며, 기온은 ${temp}°C입니다.`, 'bot');
                } else {
                    addMessage('날씨 정보를 가져오는 데 실패했습니다.', 'bot');
                }
            })
            .catch(error => {
                console.error('날씨 정보를 가져오는 데 실패했습니다:', error);
                addMessage('날씨 정보를 가져오는 데 실패했습니다. 오류: ' + error.message, 'bot');
            });
    }

    // 도움말 표시 함수
    function showHelp() {
        const helpMessage = `
            사용 가능한 명령어:
            - 한식, 중식, 일식, 햄버거, 치킨, 피자, 분식, 카페
            - 주변 음식점 검색
            - 날씨
            - 최근 검색한 음식점
        `;
        addMessage(helpMessage, 'bot');
    }

    // 주변 식당 목록을 가져오는 함수
    async function getRestaurantList(category) {
        const restaurantList = document.getElementById('restaurantList');
        if (!restaurantList) {
            console.error('   당 목록 요  를 찾을 수 없습니다.');
            return; // 요소가 없으면 종료
        }
        restaurantList.innerHTML = ''; // 기존 목록 초기화

        // 카카오 API를 사용하여 주변 식당 데이터 가져오기
        try {
            const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(category)}&size=15`, {
                headers: {
                    Authorization: 'KakaoAK f7119e49723e72f9501cdec0b95d38e8' // REST API 키를 여기에 넣습니다.
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // HTTP 오류 처리
            }

            const data = await response.json(); // JSON 형식으로 데이터 가져오기

            // 식당 데이터가 존재하는 경우
            if (data.documents && data.documents.length > 0) {
                data.documents.forEach(restaurant => {
                    const item = document.createElement('div');
                    item.className = 'restaurant-item';
                    item.innerHTML = `
                        <h4>${restaurant.place_name}</h4>
                        <p>${restaurant.road_address_name || restaurant.address_name}</p>
                    `;
                    restaurantList.appendChild(item);

                    // 식당 클릭 시 카카오맵 상세 정보 페이지로 이동
                    item.addEventListener('click', () => {
                        const url = `https://place.map.kakao.com/${restaurant.id}`; // 카카오맵 상세보기 URL
                        window.open(url, '_blank'); // 새 탭에서 열기
                    });
                });
            } else {
                restaurantList.innerHTML = '<p>해당 카테고리의 식당이 없습니다.</p>'
            }
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            restaurantList.innerHTML = '<p>식당 정보를 가져오는 데 오류가 발생했습니다.</p>';
        }
    }

    // 카테고리 클릭 이벤트 리스너 추가
    const categories = document.querySelectorAll('.category img'); // 카테고리 이미지 선택
    categories.forEach(category => {
        category.addEventListener('click', () => {
            const categoryName = category.alt; // 이미지의 alt 속성에서 카테고리 이름 가져오기
            getRestaurantList(categoryName); // 선택한 카테고리의 식당 목록 가져오기
        });
    });

    // 위치찾기 버튼 클릭 시 호출되는 함수
    const locationButton = document.getElementById('findCurrentLocationButton');
    
    if (locationButton) { // 버튼이 존재하는지 확인
        locationButton.addEventListener('click', function() {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude; // 위도
                const lng = position.coords.longitude; // 경도

                // 지도 생성
                const locPosition = new kakao.maps.LatLng(lat, lng);
                map.setCenter(locPosition); // 지도의 중심을 현재 위치로 설정
                marker.setPosition(locPosition); // 마커 위치 설정
                map.setLevel(3); // 확대 수준 설정

                // 현재 위치 마커 추가
                const currentMarker = new kakao.maps.Marker({
                    position: locPosition,
                    map: map // 현재 위치 마커를 지도에 추가
                });

                // 지도를 표시
                document.getElementById('map').style.display = 'block'; // 지도를 보이게 함
            }, function(error) {
                console.error('위치 정보 가져오기 실패:', error);
                alert('위치 정보를 가져오는 데 실패했습니다.');
            });
        });
    } else {
        console.error('위치찾기 버튼이 존재하지 않습니다.');
    }

    const orderHistoryBtn = document.getElementById('orderHistoryBtn');
    const clearOrderHistoryBtn = document.getElementById('clearOrderHistoryBtn');

    if (orderHistoryBtn) {
        orderHistoryBtn.addEventListener('click', function() {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const orderList = document.getElementById('orderList');

            if (orderList) {
                orderList.innerHTML = ''; // 기존 내용 초기화

                if (orders.length === 0) {
                    orderList.innerHTML = '<p>주문 내역이 없습니다.</p>';
                } else {
                    orders.forEach(order => {
                        const orderItem = document.createElement('div');
                        orderItem.classList.add('order-item'); // 클래스 추가
                        orderItem.innerHTML = `
                            <h4>${order.name}</h4>
                            
                            <p>요청 사항: ${order.request}</p>
                            <p>결제 수단: ${order.paymentMethod}</p>
                            <p>결제 금액: ${order.totalAmount}</p>
                            <p>주문 시간: ${order.orderTime}</p> <!-- 주문 시간 추가 -->
                        `;
                        orderList.appendChild(orderItem);
                    });
                }

                // 주문 내역 표시
                document.getElementById('orderHistory').style.display = 'block';
            } else {
                console.error('orderList 요소를 찾을 수 없습니다.');
            }
        });
    } else {
        console.error('orderHistoryBtn 요소를 찾을 수 없습니다.');
    }

    if (clearOrderHistoryBtn) {
        clearOrderHistoryBtn.addEventListener('click', function() {
            localStorage.removeItem('orders'); // 주문 내역 삭제
            alert('주문 내역이 삭제되었습니다.');
            // 주문 내역을 삭제한 후 화면을 업데이트
            document.getElementById('orderList').innerHTML = '<p>주문 내역이 없습니다.</p>';
            document.getElementById('orderHistory').style.display = 'block'; // 주문 내역 표시
        });
    }
});

// 초기화 함수 호출
function initializeApp() {
    const container = document.getElementById('map'); // 지도를 표시할 요소
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.978), // 서울의 위도와 경도
        level: 3 // 확대 수준
    };

    map = new kakao.maps.Map(container, options); // 지도 생성
    marker = new kakao.maps.Marker({
        position: options.center, // 마커의 위치
        map: map // 마커를 지도에 추가
    });

    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(position => {
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords); // 지도의 중심을 현재 위치로 설정
        marker.setPosition(coords); // 마커 위치 설정
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });

    // 지도 클릭 이벤트 추가
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng; // 클릭한 위치의 좌표

        // 기존 마커가 있다면 제거
        if (marker) {
            marker.setMap(null); // 기존 마커 제거
        }

        // 새로운 마커 생성
        marker = new kakao.maps.Marker({
            position: latlng, // 클릭한 위치
            map: map // 마커를 지도에 추가
        });

        map.setCenter(latlng); // 지도의 중심을 클릭한 위치로 설정
    });
}

function coordsToAddress(coords) {
    return new Promise((resolve, reject) => {
        const lng = coords.getLng();
        const lat = coords.getLat();
        
        console.log('좌표:', { lng, lat });

        fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`, {
            method: 'GET',
            headers: {
                Authorization: 'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => {
            if (!response.ok) {
                console.error('응답 오류:', response.status, response.statusText);
                reject(new Error('주소 변환 요청에 실패했습니다. 상태 코드: ' + response.status));
            }
            return response.json();
        })
        .then(data => {
            if (data.documents.length > 0) {
                resolve(data.documents[0]);
            } else {
                console.error('주소 변환 실패: 결과 없음');
                reject(new Error('주소 변환 실패: 유효한 주소를 찾을 수 없습니다.'));
            }
        })
        .catch(error => {
            console.error('주소 변환 실패:', error.message);
            reject(new Error('주소 변환 실패: ' + error.message));
        });
    });
}

document.getElementById('getAddress').addEventListener('click', () => {
    const position = marker.getPosition();
    coordsToAddress(position)
        .then(address => {
            document.getElementById('result').innerText = `주소: ${address.address.address_name}`;
        })
        .catch(error => {
            document.getElementById('result').innerText = error.message;
        });
});

function openAddressInputModal(addressData, position) {
    const baseAddress = addressData.address?.address_name || '';
    document.getElementById('baseAddress').textContent = baseAddress;
    addressInputModal.style.display = 'block';

    const saveBtn = addressInputModal.querySelector('.save-btn');
    const cancelBtn = addressInputModal.querySelector('.cancel-btn');
    
    saveBtn.onclick = () => saveAddress(addressData, position);
    cancelBtn.onclick = closeAllModals;
}

function closeAllModals() {
    addressModal.style.display = 'none';
    mapModal.style.display = 'none';
    addressInputModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

function saveAddress(addressData, position) {
    const detailAddress = document.getElementById('detailAddress').value.trim();
    if (!detailAddress) {
        alert('상세 주소를 입력해주세요');
        return;
    }

    const locationData = {
        baseAddress: addressData.address?.address_name || '',
        detailAddress: detailAddress,
        fullAddress: `${addressData.address?.address_name || ''} ${detailAddress}`,
        lat: position.getLat(),
        lng: position.getLng(),
        timestamp: new Date().getTime()
    };

    saveToLocalStorage(locationData);
    updateLocationDisplay(locationData);
    closeAllModals();
}

function saveToLocalStorage(locationData) {
    let locations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    locations = locations.filter(loc => 
        loc.baseAddress !== locationData.baseAddress || 
        loc.detailAddress !== locationData.detailAddress
    );
    locations.unshift(locationData);
    if (locations.length > 5) locations.pop();
    localStorage.setItem('recentLocations', JSON.stringify(locations));
    loadRecentLocations();
}

function loadRecentLocations() {
    const recentList = document.querySelector('.recent-locations');
    if (!recentList) return;

    const recentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    
    if (recentLocations.length === 0) {
        recentList.innerHTML = '<div class="no-locations">최근 설정한 위치가 없습니다.</div>';
        return;
    }

    recentList.innerHTML = recentLocations.map(location => `
        <div class="location-item">
            <div class="location-info">
                <p class="base-address">${location.baseAddress}</p>
                <p class="detail-address">${location.detailAddress || ''}</p>
            </div>
            <button class="select-btn">선택</button>
        </div>
    `).join('');

    recentList.querySelectorAll('.select-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectLocation(recentLocations[index]);
        });
    });
}

function selectLocation(location) {
    const locationBtn = document.querySelector('.location-btn');
    locationBtn.innerHTML = `
        <span class="material-icons">위치</span>
        ${location.baseAddress}
    `;
    
    // 선택한 위치로 지도 중심과 마커 이동
    const coords = new kakao.maps.LatLng(location.lat, location.lng);
    if (map && marker) {
        map.setCenter(coords);
        marker.setPosition(coords);
    }

    // 현재 선택된 위치를 localStorage에 저장
    localStorage.setItem('currentLocation', JSON.stringify(location));
    
    // 모달 닫기
    const addressModal = document.getElementById('addressModal');
    const modalOverlay = document.getElementById('modalOverlay');
    addressModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

function updateLocationDisplay(locationData) {
    const locationBtn = document.querySelector('.location-btn');
    if (locationData) {
        locationBtn.innerHTML = `
            <span class="material-icons">위치</span>
            ${locationData.baseAddress}
        `;
    } else {
        const lastLocation = JSON.parse(localStorage.getItem('recentLocations') || '[]')[0];
        if (lastLocation) {
            locationBtn.innerHTML = `
                <span class="material-icons">위치</span>
                ${lastLocation.baseAddress}
            `;
        }
    }
}

function saveRecentLocation(addressData) {
    let recentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    recentLocations.unshift(addressData);
    if (recentLocations.length > 5) {
        recentLocations = recentLocations.slice(0, 5);
    }
    localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
    loadRecentLocations();
}
function saveRecentRestaurant(restaurant) {
    let recentRestaurants = JSON.parse(localStorage.getItem('recentRestaurants') || '[]');
    
    // 이미 저장된 식당이 있는지 확인
    recentRestaurants = recentRestaurants.filter(r => r.name !== restaurant.name); // 중복 제거
    recentRestaurants.unshift(restaurant); // 새로운 식당 추가

    // 최대 2개까지만 저장
    if (recentRestaurants.length > 2) {
        recentRestaurants.pop(); // 2개 초과 시 가장 오래된 식당 제거
    }

    localStorage.setItem('recentRestaurants', JSON.stringify(recentRestaurants));
}
// 식 클릭 시 호출되는 함수
function onRestaurantClick(restaurant) {
    saveRecentRestaurant({
        name: restaurant.place_name,
        rating: restaurant.rating, // 예시로 추가한 평점
        image: restaurant.image || 'default.jpg', // 이미지 URL
        details: `최소주문금액: ${restaurant.min_order || '정보 없음'}<br>배달시간: ${restaurant.delivery_time || '정보 없음'}` // 예시로 추가한 세부정보
    });

    // 추가적인 동작 (예: 상세 페이지로 이동)
    const url = `https://place.map.kakao.com/${restaurant.id}`; // 카카오맵 상세보기 URL
    window.open(url, '_blank'); // 새 탭에서 열기
}
function loadRecentRestaurants() {
    const recentRestaurants = JSON.parse(localStorage.getItem('recentRestaurants') || '[]');
    
    const recentContainer = document.querySelector('.recent-restaurants'); // 최근 식당을 표시할 컨테이너

   // 기존 내용 초기화

    recentRestaurants.forEach(restaurant => {
        const item = document.createElement('div');
        item.className = 'restaurant-item';
        item.innerHTML = `
            
            <div class="restaurant-info">
                <h4>${restaurant.name}</h4>
                <p class="rating">${restaurant.rating}</p>
                <p class="details">${restaurant.details}</p>
            </div>
        `;
        recentContainer.appendChild(item);
    });
}

function updateLocationButton(addressData) {
    const locationBtn = document.querySelector('.location-btn');
    locationBtn.innerHTML = `
        <span class="material-icons"></span>
        ${addressData.baseAddress} ${addressData.detailAddress}
    `;
}

function closeAllModals() {
    document.getElementById('mapModal').style.display = 'none';
    document.getElementById('addressInputModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('detailAddress').value = ''; // 입력 필드 초기화
}

function searchRestaurants(categoryCode) {
    // 저장된 현재 위치 확인
    const savedLocation = localStorage.getItem('currentLocation');
    
    if (savedLocation) {
        // 저장된 위치가 있으면 그 위치 사용
        const location = JSON.parse(savedLocation);
        const coords = new kakao.maps.LatLng(location.lat, location.lng);
        executeSearch(coords, categoryCode);
    } else {
        // 저장된 위치가 없으면 현재 위치 사용
        navigator.geolocation.getCurrentPosition(position => {
            const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            executeSearch(coords, categoryCode);
        }, error => {
            console.error('위치 정보 가져오기 실패:', error);
            alert('위치 정보를 가져오는 데 실패했습니다.');
        });
    }
}

function executeSearch(coords, categoryCode) {
    if (categoryCode === 'FD6') { // 한식
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=한식`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: 'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const koreanRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('한식') || 
                 place.category_name.includes('한식당') ||
                 place.category_name.includes('한국요리'))
            );
            displayRestaurants(koreanRestaurants, 'FD6');
        })
        .catch(error => {
            console.error('한식당 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD7') { // 중식
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=중국집`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const chineseRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('중식') || 
                 place.category_name.includes('중국집') ||
                 place.category_name.includes('중국요리'))
            );
            displayRestaurants(chineseRestaurants, 'FD7');
        })
        .catch(error => {
            console.error('중식당 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD8') { // 일식
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=일식`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const japaneseRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('일식') || 
                 place.category_name.includes('일본요리') ||
                 place.category_name.includes('초밥') ||
                 place.category_name.includes('라멘'))
            );
            displayRestaurants(japaneseRestaurants, 'FD8');
        })
        .catch(error => {
            console.error('일식당 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD9') { // 햄버거
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=햄버거`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const burgerRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('햄버거') || 
                 place.category_name.includes('버거') ||
                 place.category_name.includes('패스트푸드'))
            );
            displayRestaurants(burgerRestaurants, 'FD9');
        })
        .catch(error => {
            console.error('햄버거 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD10') { // 치킨
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=치킨`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const chickenRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('치킨') || 
                 place.category_name.includes('닭요리') ||
                 place.category_name.includes('후라이드'))
            );
            displayRestaurants(chickenRestaurants, 'FD10');
        })
        .catch(error => {
            console.error('치킨집 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD11') { // 피자
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=피자`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const pizzaRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('피자') || 
                 place.category_name.includes('피자전문점'))
            );
            displayRestaurants(pizzaRestaurants, 'FD11');
        })
        .catch(error => {
            console.error('피자집 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD12') { // 분식
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=분식`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: 'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const snackRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('분식') || 
                 place.category_name.includes('떡볶이') ||
                 place.category_name.includes('김밥'))
            );
            displayRestaurants(snackRestaurants, 'FD12');
        })
        .catch(error => {
            console.error('분식집 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    } else if (categoryCode === 'FD13') { // 카페
        const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=카페`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
            }
        })
        .then(response => response.json())
        .then(data => {
            const cafeRestaurants = data.documents.filter(place => 
                place.category_name && 
                (place.category_name.includes('카페') || 
                 place.category_name.includes('디저트') ||
                 place.category_name.includes('베이커리') ||
                 place.category_name.includes('커피'))
            );
            displayRestaurants(cafeRestaurants, 'FD13');
        })
        .catch(error => {
            console.error('카페/디저트 검색 실패:', error);
            alert('식당 검색에 실패했습니다.');
        });
    }
}

function displayRestaurants(restaurants, categoryCode) {
    const restaurantList = document.getElementById('restaurantList');
    restaurantList.innerHTML = ''; // 기존 목록 초기화

    if (!restaurants || restaurants.length === 0) { // restaurants가 정의되어 있는지 확인
        restaurantList.innerHTML = '<p>주변에 맛집이 없습니다.</p>';
        return;
    }

    restaurants.forEach((restaurant) => {
        const item = document.createElement('div');
        item.className = 'restaurant-item';
        item.innerHTML = `
            <h4>${restaurant.place_name}</h4>
            <p>${restaurant.road_address_name || restaurant.address_name}</p>
            <p>전화: ${restaurant.phone || '전화번호 없음'}</p>
        `;

        // 식당 클릭 시 카카오맵 상세 정보 페이지로 이동
        item.addEventListener('click', () => {
            const url = `https://place.map.kakao.com/${restaurant.id}`; // 카카오맵 상세보기 URL
            window.open(url, '_blank'); // 새 탭에서 열기
        });

        restaurantList.appendChild(item);
    });
}

function showRestaurantDetail(restaurant) {
    const restaurantInfo = document.getElementById('restaurantInfo');
    restaurantInfo.innerHTML = `
        <h2>${restaurant.place_name}</h2>
        <p>주소: ${restaurant.road_address_name || restaurant.address_name}</p>
        <p>전화: ${restaurant.phone || '전화번호 없음'}</p>
        <p>거리: ${Math.round(restaurant.distance)}m</p>
        <button onclick="openKakaoMap('${restaurant.place_url}')">카카오맵에서 보기</button>
    `;
    document.getElementById('restaurantDetail').style.display = 'block';
}

function openKakaoMap(url) {
    window.open(url, '_blank');
}

// 한식 검색을 위한 함수
function getCurrentPositionAndSearchKorean() {
    if (!map) {
        console.error('지도 객체가 초기화되지 않았습니다.');
        return; // map이 초기화되지 않았으면 함수 종료
    }

    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords); // map이 초기화된 후에 호출
        marker.setPosition(coords);
        searchRestaurants('FD6'); // 한식만 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 중식 검색을 위한 함수
function getCurrentPositionAndSearchChinese() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD7'); // 중식만 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 일식 검색을 위한 함수
function getCurrentPositionAndSearchJapanese() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD8'); // 일식 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 햄버거 검색을 위한 함수
function getCurrentPositionAndSearchBurger() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD9'); // 햄버거 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 치킨 검색을 위한 함수
function getCurrentPositionAndSearchChicken() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD10'); // 치킨 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 피자 검색을 위한 함수
function getCurrentPositionAndSearchPizza() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD11'); // 피자 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 분식 검색을 위한 함수
function getCurrentPositionAndSearchSnack() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD12'); // 분식 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 카페/디저트 검색을 위한 함수
function getCurrentPositionAndSearchCafe() {
    navigator.geolocation.getCurrentPosition(position => {
        console.log('위치 정보:', position);
        const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(coords);
        marker.setPosition(coords);
        searchRestaurants('FD13'); // 카페/디저트 검색
    }, error => {
        console.error('위치 정보 가져오기 실패:', error);
        alert('위치 정보를 가져오는 데 실패했습니다.');
    });
}

// 이벤트 리스너 수정
document.getElementById("searchKorean").addEventListener("click", () => {
    getCurrentPositionAndSearchKorean();
});

document.getElementById("searchChinese").addEventListener("click", () => {
    getCurrentPositionAndSearchChinese();
});

document.getElementById("searchJapanese").addEventListener("click", () => {
    getCurrentPositionAndSearchJapanese();
});

document.getElementById("searchBurger").addEventListener("click", () => {
    getCurrentPositionAndSearchBurger();
});

document.getElementById("searchChicken").addEventListener("click", () => {
    getCurrentPositionAndSearchChicken();
});

document.getElementById("searchPizza").addEventListener("click", () => {
    getCurrentPositionAndSearchPizza();
});

document.getElementById("searchSnack").addEventListener("click", () => {
    getCurrentPositionAndSearchSnack();
});

document.getElementById("searchCafe").addEventListener("click", () => {
    getCurrentPositionAndSearchCafe();
});

// 키워드 검색 함수 추가
function searchByKeyword(keyword) {
    // 저장된 현재 위치 확인
    const savedLocation = localStorage.getItem('currentLocation');
    
    if (savedLocation) {
        // 저장된 위치가 있으면 그 위치 사용
        const location = JSON.parse(savedLocation);
        const coords = new kakao.maps.LatLng(location.lat, location.lng);
        executeKeywordSearch(coords, keyword);
    } else {
        // 저장된 위치가 없으면 현재 위치 사용
        navigator.geolocation.getCurrentPosition(position => {
            const coords = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
            executeKeywordSearch(coords, keyword);
        }, error => {
            console.error('위치 정보 가져오기 실패:', error);
            alert('위치 정보를 가져오는 데 실패했습니다.');
        });
    }
}

// 키워드 검색 실행 함수
function executeKeywordSearch(coords, keyword) {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${coords.getLat()}&x=${coords.getLng()}&radius=5000&query=${encodeURIComponent(keyword)}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            Authorization:  'KakaoAK f7119e49723e72f9501cdec0b95d38e8'
        }
    })
    .then(response => response.json())
    .then(data => {
        // 음식점 카테고리만 필터링
        const restaurants = data.documents.filter(place => 
            place.category_group_code === 'FD6' || // 음식점
            place.category_name.includes('음식') ||
            place.category_name.includes('카페') ||
            place.category_name.includes('식당') ||
            place.category_name.includes('치킨') ||
            place.category_name.includes('피자') ||
            place.category_name.includes('햄버거')
        );

        // 검색 결과 표시
        displaySearchResults(restaurants, keyword);
    })
    .catch(error => {
        console.error('검색 실패:', error);
        alert('검색에 실패했습니다.');
    });
}

// 검색 결과 표시 함수
function displaySearchResults(restaurants, keyword) {
    const restaurantList = document.getElementById('restaurantList');
    restaurantList.innerHTML = '';

    if (restaurants.length === 0) {
        restaurantList.innerHTML = `
            <div class="no-restaurants">
                <p>주변에 "${keyword}" 검색 결과가 없습니다.</p>
            </div>`;
        return;
    }

    const titleDiv = document.createElement('div');
    titleDiv.className = 'restaurant-category-title';
    titleDiv.innerHTML = `<h3>"${keyword}" 검색 결과</h3>`;
    restaurantList.appendChild(titleDiv);

    restaurants.forEach(restaurant => {
        const name = restaurant.place_name;
        const address = restaurant.road_address_name || restaurant.address_name;
        const distance = Math.round(restaurant.distance) + 'm';
        const phone = restaurant.phone || '전화번호 없음';
        const category = restaurant.category_name.split('>').pop().trim();

        const item = document.createElement('div');
        item.className = 'restaurant-item';
        item.innerHTML = `
            <h4>${name}</h4>
            <p class="restaurant-category">${category}</p>
            <p class="restaurant-address">${address}</p>
            <p class="restaurant-distance">거리: ${distance}</p>
            <p class="restaurant-phone">전화: ${phone}</p>
        `;

        item.addEventListener('click', () => {
            showRestaurantDetail(restaurant);
        });

        restaurantList.appendChild(item);
    });

    // 검색 결과로 스크롤
    document.querySelector('.restaurant-container').scrollIntoView({ behavior: 'smooth' });
}

// Geolocation API를 사용하여 현재 위치를 가져오는 함수
document.getElementById('searchAddressBtn').addEventListener('click', function() {
    const addressInput = document.getElementById('addressInput').value.trim();
    if (addressInput) {
        searchAddress(addressInput);
    } else {
        alert('주소를 입력해주세요.');
    }
});

function searchAddress(query) {
    const geocoder = new kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(query, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            // 검색 결과가 있을 경우
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = ''; // 기존 결과 초기화

            result.forEach(item => {
                const address = item.address.address_name;
                const itemDiv = document.createElement('div');
                itemDiv.className = 'search-result-item';
                itemDiv.innerHTML = `
                    <p>${address}</p>
                    <button onclick="selectAddress('${address}')">선택</button>
                `;
                searchResults.appendChild(itemDiv);
            });
        } else {
            alert('주소 검색에 실패했습니다. 다시 시도해 주세요.');
        }
    });
}

function selectAddress(address) {
    document.getElementById('baseAddress').textContent = address; // 선택한 주소 표시
    document.getElementById('addressInputModal').style.display = 'none'; // 모달 닫기
}

// 주문 완료 시 호출되는 함수
function completeOrder(orderDetails) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderDetails); // 새로운 주문 추가
    localStorage.setItem('orders', JSON.stringify(orders)); // 저장
}


