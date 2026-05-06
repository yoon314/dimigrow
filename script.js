/**
 * 디미고 학생 키우기 - 에피소드 순차 소모 시스템
 */

const INITIAL_STATS = { coding: 20, academic: 20, stamina: 80, mental: 80, social: 20, money: 50 };

const ACTIONS = [
    { id: 'coding', name: '코딩 공부', icon: 'code', color: '#1A1A1A', effect: { coding: 8, mental: -4, stamina: -4 } },
    { id: 'study', name: '시험 공부', icon: 'book-open', color: '#E11D74', effect: { academic: 8, mental: -5, stamina: -3 } },
    { id: 'exercise', name: '운동하기', icon: 'dumbbell', color: '#475569', effect: { stamina: 10, mental: 5, coding: -1 } },
    { id: 'hangout', name: '친구와 놀기', icon: 'users', color: '#E11D74', effect: { social: 8, mental: 8, money: -5 } },
    { id: 'sleep', name: '푹 자기', icon: 'moon', color: '#1A1A1A', effect: { stamina: 15, mental: 10, academic: -1 } }
];

// 선생님별 에피소드 데이터 (순서대로 등장함)
const TEACHER_DATABASE = {
    JEJE: {
        name: "제제쌤", role: "사회선생님", emoji: "🧘",
        episodes: [
            {
                id: "JEJE_Q1",
                intro: "안녕, 여러분. 오늘은 조금 깊은 이야기를 해볼까요?",
                text: "제제쌤이 칠판에 큰 글씨로 쓰십니다. '여러분들은 왜 사시나요?'",
                options: [
                    { label: "행복하기 위해서요!", effect: { mental: 15, social: 5 }, msg: "맞아요. 행복은 우리 삶의 가장 큰 이유죠." },
                    { label: "사랑하기 위해서요!", effect: { mental: 15, social: 10 }, msg: "아름다운 답변이네요. 사랑이 세상을 구원하니까요." }
                ]
            },
            {
                id: "JEJE_Q2",
                intro: "삶의 목적을 찾았다면, 이제 실천할 차례예요.",
                text: "사회 시간, 봉사활동과 공동체의 가치에 대해 토론이 벌어졌습니다.",
                options: [
                    { label: "타인을 돕는 기쁨에 대해 발표한다.", effect: { social: 15, mental: 5 }, msg: "선생님이 당신의 따뜻한 마음씨를 칭찬하십니다." },
                    { label: "조용히 경청하며 생각에 잠긴다.", effect: { mental: 10, academic: 5 }, msg: "내면이 한 층 더 성숙해지는 기분입니다." }
                ]
            },
            {
                id: "JEJE_HIDDEN",
                isHidden: true, // 히든 아이스크림 이벤트
                intro: "쉿, 이건 우리끼리 비밀이에요.",
                text: "제제쌤이 고생하는 여러분을 위해 아이스크림을 쏘셨습니다! '와'와 '설레임' 중 무엇을 먹을까요?",
                options: [
                    { label: "와 (시원함 가득)", effect: { mental: 30, stamina: 20 }, msg: "머리가 띵할 정도로 시원합니다! 행복지수 폭발!" },
                    { label: "설레임 (달콤함 가득)", effect: { mental: 30, social: 15 }, msg: "친구들과 나눠 먹으니 기분이 최고예요!" }
                ]
            }
        ]
    },
    CS_HAM: {
        name: "하미영", role: "정보기술선생님", emoji: "💻",
        episodes: [
            {
                id: "HAM_Q1",
                intro: "자, 지옥의 코딩 시간입니다.",
                text: "첫 수업부터 과제가 산더미입니다. 어떻게 할까요?",
                options: [
                    { label: "밤을 새워 완벽하게 제출한다.", effect: { coding: 20, stamina: -30 }, msg: "선생님이 당신의 끈기를 높게 평가합니다." },
                    { label: "적당히 타협해서 제출한다.", effect: { coding: 5, stamina: 10 }, msg: "체력을 온존하며 무난하게 넘어갑니다." }
                ]
            },
            {
                id: "HAM_Q2",
                intro: "코드 리뷰 시간입니다.",
                text: "여러분의 코드를 전교생 앞에서 공개한다고 합니다!",
                options: [
                    { label: "자신 있게 코드를 설명한다.", effect: { coding: 15, social: 10 }, msg: "깔끔한 로직에 모두가 감탄합니다." },
                    { label: "부족한 점을 보완해서 다시 내겠다고 한다.", effect: { academic: 10, mental: 5 }, msg: "배움에 대한 열정을 인정받았습니다." }
                ]
            }
        ]
    }
};

let state = {
    gameState: 'START',
    day: 1,
    name: '',
    stats: { ...INITIAL_STATS },
    log: null,
    currentEvent: null,
    // 선생님별 현재 진행 중인 에피소드 인덱스 관리 (중복 방지의 핵심)
    episodeProgress: { JEJE: 0, CS_HAM: 0, PRESIDENT: 0 },
    history: { actions: [], events: [] }
};

function startGame() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) return;
    
    state = {
        gameState: 'PLAYING', day: 1, name: name,
        stats: { ...INITIAL_STATS }, log: null, currentEvent: null,
        episodeProgress: { JEJE: 0, CS_HAM: 0, PRESIDENT: 0 },
        history: { actions: [], events: [] }
    };
    render();
}

function handleAction(id) {
    const action = ACTIONS.find(a => a.id === id);
    let ns = { ...state.stats };
    Object.entries(action.effect).forEach(([k, v]) => {
        ns[k] = Math.min(100, Math.max(0, ns[k] + v));
    });

    state.stats = ns;
    state.log = { 
        actionName: action.name, 
        effects: Object.entries(action.effect).map(([k,v]) => ({key:k, val:v})) 
    };
    
    // 50% 확률로 이벤트 발생
    if (Math.random() < 0.5) triggerEvent();
    else nextDay();
}

function triggerEvent() {
    // 아직 볼 수 있는 에피소드가 남은 선생님들만 필터링
    const availableKeys = Object.keys(TEACHER_DATABASE).filter(key => {
        return state.episodeProgress[key] < TEACHER_DATABASE[key].episodes.length;
    });

    if (availableKeys.length === 0) {
        nextDay();
        return;
    }

    // 무작위 선생님 선택
    const chosenKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    const teacher = TEACHER_DATABASE[chosenKey];
    const episodeIndex = state.episodeProgress[chosenKey];
    const episode = teacher.episodes[episodeIndex];

    state.currentEvent = {
        teacher,
        key: chosenKey,
        data: episode,
        type: episode.isHidden ? 'HIDDEN' : 'DIALOG'
    };
    render();
}

function solveEvent(optionIdx) {
    const { teacher, data, key } = state.currentEvent;
    const option = data.options[optionIdx];
    
    // 능력치 반영
    Object.entries(option.effect).forEach(([k, v]) => {
        state.stats[k] = Math.min(100, Math.max(0, state.stats[k] + v));
    });

    // 핵심: 해당 선생님의 다음 에피소드로 진행 (중복 방지)
    state.episodeProgress[key]++;

    // 로그 기록
    const prefix = data.isHidden ? '[★특별★] ' : `[${teacher.name}] `;
    state.log = { 
        actionName: prefix + option.msg, 
        effects: Object.entries(option.effect).map(([k, v]) => ({ key: k, val: v })) 
    };
    
    state.currentEvent = null;
    nextDay();
}

function nextDay() {
    if (state.day >= 30) state.gameState = 'ENDING';
    else state.day++;
    render();
}

function render() {
    const container = document.getElementById('game-container');
    
    if (state.gameState === 'START') {
        container.innerHTML = `
            <div class="screen-full animate-in">
                <div class="logo-header">
                    <div class="logo-symbol">@</div>
                    <div class="logo-text">
                        <span class="logo-text-top">KDMHS</span>
                        <span class="logo-text-bottom">디미고 학생 키우기</span>
                    </div>
                </div>
                <input type="text" id="name-input" class="input-name" placeholder="학생 이름을 입력하세요">
                <button onclick="startGame()" class="btn-main">입학하기</button>
            </div>
        `;
    } else if (state.gameState === 'PLAYING') {
        container.innerHTML = `
            <div class="content-area">
                <div class="top-bar">
                    <div>
                        <div style="font-size:0.6rem; color:#E11D74; font-weight:900;">DAY ${state.day}/30</div>
                        <div style="font-size:1.2rem; font-weight:900;">${state.name}</div>
                    </div>
                    <div class="hp-badge">HP ${state.stats.stamina}</div>
                </div>
                <div class="stats-grid">
                    ${renderStat('코딩', state.stats.coding, '#1A1A1A')}
                    ${renderStat('내신', state.stats.academic, '#E11D74')}
                    ${renderStat('멘탈', state.stats.mental, '#E11D74')}
                    ${renderStat('관계', state.stats.social, '#1A1A1A')}
                </div>
                <div class="log-area">
                    ${state.log ? `
                        <div class="log-card animate-in">
                            <div style="font-weight:900; margin-bottom:0.3rem;">${state.log.actionName}</div>
                            <div style="display:flex; gap:0.5rem;">
                                ${state.log.effects.map(e => `<span style="font-size:0.6rem; color:${e.val > 0 ? '#E11D74' : '#666'}">${e.key} ${e.val > 0 ? '+' : ''}${e.val}</span>`).join('')}
                            </div>
                        </div>
                    ` : '<div style="text-align:center; color:#ccc; margin-top:3rem;">선택을 기다리고 있습니다.</div>'}
                </div>
                <div class="action-bar">
                    ${ACTIONS.map(a => `
                        <button onclick="handleAction('${a.id}')" class="action-btn">
                            <div class="icon-box" style="background:${a.color}"><i data-lucide="${a.icon}" style="width:1.2rem;"></i></div>
                            <span style="font-size:0.55rem; font-weight:900;">${a.name}</span>
                        </button>
                    `).join('')}
                </div>
                ${state.currentEvent ? renderModal() : ''}
            </div>
        `;
    } else if (state.gameState === 'ENDING') {
        container.innerHTML = `
            <div class="screen-full animate-in">
                <h1 style="color:#E11D74; margin-bottom:1rem;">졸업 성공!</h1>
                <p>30일간의 고교 생활이 끝났습니다.</p>
                <button onclick="state.gameState='START';render();" class="btn-main" style="margin-top:2rem;">다시 입학하기</button>
            </div>
        `;
    }
    lucide.createIcons();
}

function renderStat(label, value, color) {
    return `<div><div class="stat-header"><span>${label}</span><span>${value}</span></div><div class="progress-bg"><div class="progress-fill" style="width:${value}%; background:${color}"></div></div></div>`;
}

function renderModal() {
    const { teacher, type, data } = state.currentEvent;
    const isHidden = type === 'HIDDEN';

    return `
        <div class="modal-overlay">
            <div class="dialog-box animate-in" style="${isHidden ? 'border-top:5px solid gold;' : ''}">
                <div class="teacher-info">
                    <div class="teacher-avatar">${isHidden ? '🍦' : teacher.emoji}</div>
                    <div>
                        <div class="teacher-name">${isHidden ? '제제쌤의 깜짝 선물' : teacher.name}</div>
                        <div class="teacher-role">${teacher.role}</div>
                    </div>
                </div>
                <div class="dialog-content">
                    <p style="font-style:italic; color:#94a3b8; font-size:0.8rem; margin-bottom:0.5rem;">"${data.intro}"</p>
                    <p class="dialog-text">${data.text}</p>
                </div>
                <div class="option-list">
                    ${data.options.map((opt, i) => `
                        <button class="option-btn" onclick="solveEvent(${i})">${opt.label}</button>
                    `).join('')}
                </div>
            </div>
        </div>`;
}

window.onload = render;