/**
 * 디미고 학생 키우기 - 에피소드 소모형 시스템 (중복 완전 방지)
 */

const INITIAL_STATS = { coding: 20, academic: 20, stamina: 80, mental: 80, social: 20, money: 50 };

const ACTIONS = [
    { id: 'coding', name: '코딩 공부', icon: 'code', color: '#1A1A1A', effect: { coding: 8, mental: -4, stamina: -4 } },
    { id: 'study', name: '시험 공부', icon: 'book-open', color: '#E11D74', effect: { academic: 8, mental: -5, stamina: -3 } },
    { id: 'exercise', name: '운동하기', icon: 'dumbbell', color: '#475569', effect: { stamina: 10, mental: 5, coding: -1 } },
    { id: 'hangout', name: '친구와 놀기', icon: 'users', color: '#E11D74', effect: { social: 8, mental: 8, money: -5 } },
    { id: 'sleep', name: '푹 자기', icon: 'moon', color: '#1A1A1A', effect: { stamina: 15, mental: 10, academic: -1 } }
];

// 에피소드 데이터 - 사용된 에피소드는 state에서 제거됨
const ORIGINAL_STORIES = {
    JEJE: {
        name: "제제쌤", role: "사회선생님", emoji: "🧘",
        episodes: [
            {
                id: "JEJE_1",
                intro: "안녕, 여러분. 오늘은 조금 깊은 이야기를 해볼까요?",
                text: "제제쌤이 칠판에 큰 글씨로 쓰십니다. '여러분들은 왜 사시나요?'",
                options: [
                    { label: "행복하기 위해서요!", effect: { mental: 15, social: 5 }, msg: "맞아요. 행복은 우리 삶의 가장 큰 이유죠." },
                    { label: "사랑하기 위해서요!", effect: { mental: 15, social: 10 }, msg: "아름다운 답변이네요. 사랑이 세상을 구원하니까요." }
                ]
            },
            {
                id: "JEJE_2",
                intro: "삶의 목적을 찾았다면, 이제 실천할 차례예요.",
                text: "사회 시간, 봉사활동과 공동체의 가치에 대해 토론이 벌어졌습니다.",
                options: [
                    { label: "타인을 돕는 기쁨에 대해 발표한다.", effect: { social: 15, mental: 5 }, msg: "선생님이 당신의 따뜻한 마음씨를 칭찬하십니다." },
                    { label: "조용히 경청하며 생각에 잠긴다.", effect: { mental: 10, academic: 5 }, msg: "내면이 한 층 더 성숙해지는 기분입니다." }
                ]
            },
            {
                id: "JEJE_ICE", // 히든 아이스크림 이벤트
                isHidden: true,
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
                id: "HAM_1",
                intro: "자, 지옥의 코딩 시간입니다.",
                text: "첫 수업부터 과제가 산더미입니다.",
                options: [
                    { label: "밤을 새워 제출한다.", effect: { coding: 20, stamina: -40 }, msg: "근성이 대단하군요!" },
                    { label: "타협한다.", effect: { coding: 5, stamina: 10 }, msg: "효율적인 선택입니다." }
                ]
            }
        ]
    },
    PRESIDENT: {
        name: "남승완", role: "교장선생님", emoji: "👴",
        episodes: [
            {
                id: "PRE_1",
                intro: "허허, 신입생인가?",
                text: "교장선생님이 훈화 말씀을 시작하시려 합니다.",
                options: [
                    { label: "경청한다.", effect: { social: 10, mental: -5 }, msg: "좋은 자세입니다." },
                    { label: "딴생각을 한다.", effect: { mental: 5 }, msg: "시간이 금방 갔습니다." }
                ]
            }
        ]
    }
};

const ORIGINAL_QUIZZES = {
    VICE: {
        name: "교감선생님", role: "교감선생님", emoji: "👨‍🏫",
        quizzes: [
            { id: "Q_1", q: "애국가 4절: 이 기상과 이 (  )으로", a: "맘" }
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
    history: { actions: [], events: [] },
    // 가용 에피소드 풀 (한 번 쓰면 여기서 삭제됨)
    availableStories: JSON.parse(JSON.stringify(ORIGINAL_STORIES)),
    availableQuizzes: JSON.parse(JSON.stringify(ORIGINAL_QUIZZES))
};

function startGame() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) return;
    
    state = {
        gameState: 'PLAYING', day: 1, name: name,
        stats: { ...INITIAL_STATS }, log: null, currentEvent: null,
        history: { actions: [], events: [] },
        availableStories: JSON.parse(JSON.stringify(ORIGINAL_STORIES)),
        availableQuizzes: JSON.parse(JSON.stringify(ORIGINAL_QUIZZES))
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
    state.log = { actionName: action.name, effects: Object.entries(action.effect).map(([k,v]) => ({key:k, val:v})) };
    state.history.actions.push({ day: state.day, actionId: id });

    // 50% 확률로 이벤트 발생
    if (Math.random() < 0.5) triggerEvent();
    else nextDay();
}

function triggerEvent() {
    const storyKeys = Object.keys(state.availableStories).filter(k => state.availableStories[k].episodes.length > 0);
    const quizKeys = Object.keys(state.availableQuizzes).filter(k => state.availableQuizzes[k].quizzes.length > 0);
    
    const allAvailable = [...storyKeys, ...quizKeys];
    if (allAvailable.length === 0) {
        nextDay();
        return;
    }

    const chosenKey = allAvailable[Math.floor(Math.random() * allAvailable.length)];

    if (quizKeys.includes(chosenKey)) {
        const teacher = state.availableQuizzes[chosenKey];
        const quiz = teacher.quizzes[0]; // 항상 첫 번째 가용 퀴즈 추출
        state.currentEvent = { teacher, type: 'QUIZ', key: chosenKey, data: quiz };
    } else {
        const teacher = state.availableStories[chosenKey];
        // 히든 이벤트는 일반 에피소드가 하나 이상 끝난 후에만 나올 수 있도록 조정하거나 0번 인덱스 추출
        let episodeIdx = 0;
        // 제제쌤 아이스크림 이벤트는 무작위성을 위해 셔플될 수 있으나 여기선 순차적 소모
        const episode = teacher.episodes[episodeIdx];
        state.currentEvent = { teacher, type: episode.isHidden ? 'HIDDEN' : 'DIALOG', key: chosenKey, data: episode };
    }
    render();
}

function solveDialog(idx) {
    const { teacher, data, key } = state.currentEvent;
    const option = data.options[idx];
    
    Object.entries(option.effect).forEach(([k, v]) => {
        state.stats[k] = Math.min(100, Math.max(0, state.stats[k] + v));
    });

    // 핵심: 사용한 에피소드 제거
    state.availableStories[key].episodes = state.availableStories[key].episodes.filter(ep => ep.id !== data.id);

    state.history.events.push({ day: state.day, teacherName: teacher.name, result: option.msg });
    state.log = { actionName: `[${teacher.name}] ${option.msg}`, effects: Object.entries(option.effect).map(([k, v]) => ({ key: k, val: v })) };
    state.currentEvent = null;
    nextDay();
}

function solveQuiz() {
    const { teacher, data, key } = state.currentEvent;
    const input = document.getElementById('quiz-ans').value.trim();
    const isCorrect = input === data.a;

    if (isCorrect) {
        state.stats.academic = Math.min(100, state.stats.academic + 12);
        state.log = { actionName: `${teacher.name}: 정답!`, effects: [{ key: 'academic', val: 12 }] };
    } else {
        state.stats.mental = Math.max(0, state.stats.mental - 10);
        state.log = { actionName: `${teacher.name}: 땡! 정답은 ${data.a}`, effects: [{ key: 'mental', val: -10 }] };
    }

    // 사용한 퀴즈 제거
    state.availableQuizzes[key].quizzes = state.availableQuizzes[key].quizzes.filter(q => q.id !== data.id);

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
            <div class="screen-full">
                <h1 style="color:#E11D74;">졸업 성공!</h1>
                <p style="margin: 1rem 0;">30일간의 기록이 마무리되었습니다.</p>
                <button onclick="state.gameState='START';render();" class="btn-main">다시 하기</button>
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
    let content = (type === 'DIALOG' || isHidden) ? `
        <p class="dialog-text">${data.text}</p>
        <div class="option-list">
            ${data.options.map((opt, i) => `<button class="option-btn" onclick="solveDialog(${i})">${opt.label}</button>`).join('')}
        </div>
    ` : `
        <p class="dialog-text">정답을 입력하세요: <br><br><b>[ ${data.q} ]</b></p>
        <input type="text" id="quiz-ans" class="quiz-input" placeholder="정답">
        <button class="btn-main" onclick="solveQuiz()">제출</button>
    `;

    return `
        <div class="modal-overlay">
            <div class="dialog-box animate-in" style="${isHidden ? 'border:3px solid #FFD700;' : ''}">
                <div class="teacher-info">
                    <div class="teacher-avatar">${isHidden ? '🍦' : teacher.emoji}</div>
                    <div>
                        <div class="teacher-name">${isHidden ? '제제쌤의 선물' : teacher.name}</div>
                        <div class="teacher-role">${teacher.role}</div>
                    </div>
                </div>
                <div style="font-style:italic; color:#94a3b8; font-size:0.8rem;">"${data.intro}"</div>
                <div class="dialog-content">${content}</div>
            </div>
        </div>`;
}

window.onload = render;