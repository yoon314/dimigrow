/**
 * 디미고 학생 키우기 - 에피소드 순차 소모 및 엔딩 통계 시스템
 */

const INITIAL_STATS = { coding: 20, academic: 20, stamina: 80, mental: 80, social: 20, money: 50 };

const ACTIONS = [
    { id: 'coding', name: '코딩 공부', icon: 'code', color: '#1A1A1A', effect: { coding: 8, mental: -4, stamina: -4 } },
    { id: 'study', name: '시험 공부', icon: 'book-open', color: '#E11D74', effect: { academic: 8, mental: -5, stamina: -3 } },
    { id: 'exercise', name: '운동하기', icon: 'dumbbell', color: '#475569', effect: { stamina: 10, mental: 5, coding: -1 } },
    { id: 'hangout', name: '친구와 놀기', icon: 'users', color: '#E11D74', effect: { social: 8, mental: 8, money: -5 } },
    { id: 'sleep', name: '푹 자기', icon: 'moon', color: '#1A1A1A', effect: { stamina: 15, mental: 10, academic: -1 } }
];

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
    },
    HS: {
        name: "행수쌤", role: "수학선생님", emoji: "📐",
        episodes: [
            {
                id: "HS_Q1",
                intro: "행수~!, 냠냠냠",
                text: "행수쌤이 복잡한 방정식을 적으십니다. '이 식의 해를 구할 사람?'",
                options: [
                    { label: "손을 번쩍 들고 정답을 맞힌다.", effect: { academic: 15, mental: 5 }, msg: "허거걱! 음음?? 너 고급행수로 왕!" },
                    { label: "계산기로 몰래 계산해본다.", effect: { coding: 10, academic: 5 }, msg: "이딴걸 써?? 선생님 삐졌어! 흥!" }
                ]
            }
        ]
    },
    NSW: {
        name: "남승완", role: "교장선생님", emoji: "👨‍🏫",
        episodes: [
            {
                id: "NSW_Q1",
                intro: "우리 학생들, 디미고의 미래가 밝군요.",
                text: "조례 시간, 교장 선생님이 훈화 말씀을 하십니다. 어떤 태도를 보일까요?",
                options: [
                    { label: "눈을 반짝이며 경청한다.", effect: { social: 15, mental: 10 }, msg: "선생님이 당신의 성실한 태도를 눈여겨보십니다." },
                    { label: "학교의 발전에 대해 질문한다.", effect: { social: 20, academic: 5 }, msg: "학생의 열정에 감동하셨습니다." }
                ]
            }
        ]
    },
    GYOGAM: {
        name: "교감쌤", role: "교감", emoji: "👴",
        episodes: [
            {
                id: "GYOGAM_Q1",
                intro: "허허, 학교 생활 즐겁게 하고 있나?",
                text: "복도에서 만난 교감 선생님이 인자하게 웃으시며 간식을 건네주십니다.",
                options: [
                    { label: "감사히 받고 인사를 드린다.", effect: { social: 10, mental: 10 }, msg: "예의 바른 모습에 기분 좋아 하십니다." },
                    { label: "다른 친구에게 양보한다.", effect: { social: 20, mental: 5 }, msg: "배려심 깊은 모습에 감동하셨습니다." }
                ]
            }
        ]
    },
    JUY: {
        name: "전유원", role: "영어선생님", emoji: "🔤",
        episodes: [
            {
                id: "JUY_QUIZ",
                intro: "안녕 1학년!",
                text: "영어 시간, 전유원 선생님이 퀴즈를 냅니다. 'What is the synonym of 'Significant'?'",
                options: [
                    { label: "Important", effect: { academic: 15, mental: 5 }, msg: "아주 잘했어요!" },
                    { label: "Tiny", effect: { academic: -5, mental: -5 }, msg: "흠.... 아니에요.... 췍!" }
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
    episodeProgress: { JEJE: 0, CS_HAM: 0, NSW: 0, HS: 0, GYOGAM: 0, JUY: 0 },
    history: { 
        actions: {}, // 각 행동별 횟수 기록
        teachers: {} // 만난 선생님별 횟수 기록
    }
};

function startGame() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) return;
    
    state = {
        gameState: 'PLAYING', day: 1, name: name,
        stats: { ...INITIAL_STATS }, log: null, currentEvent: null,
        episodeProgress: { JEJE: 0, CS_HAM: 0, NSW: 0, HS: 0, GYOGAM: 0, JUY: 0 },
        history: { actions: {}, teachers: {} }
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
    
    // 통계 기록: 행동 횟수 증가
    state.history.actions[action.name] = (state.history.actions[action.name] || 0) + 1;
    
    if (Math.random() < 0.5) triggerEvent();
    else nextDay();
}

function triggerEvent() {
    const availableKeys = Object.keys(TEACHER_DATABASE).filter(key => {
        return state.episodeProgress[key] < TEACHER_DATABASE[key].episodes.length;
    });

    if (availableKeys.length === 0) {
        nextDay();
        return;
    }

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
    
    Object.entries(option.effect).forEach(([k, v]) => {
        state.stats[k] = Math.min(100, Math.max(0, state.stats[k] + v));
    });

    // 통계 기록: 만난 선생님 횟수 증가
    state.history.teachers[teacher.name] = (state.history.teachers[teacher.name] || 0) + 1;
    
    state.episodeProgress[key]++;
    
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

function getEndingAnalysis() {
    const s = state.stats;
    const statsArray = [
        { key: 'coding', val: s.coding, name: '코딩실력' },
        { key: 'academic', val: s.academic, name: '학업성취' },
        { key: 'mental', val: s.mental, name: '정신력' },
        { key: 'social', val: s.social, name: '사회성' }
    ];
    
    const maxStat = statsArray.reduce((prev, current) => (prev.val > current.val) ? prev : current);
    
    // 가장 많이 한 활동 찾기
    let mostAction = "기록 없음";
    let maxActionCount = 0;
    Object.entries(state.history.actions).forEach(([name, count]) => {
        if (count > maxActionCount) {
            maxActionCount = count;
            mostAction = name;
        }
    });

    // 가장 자주 본 선생님 찾기
    let mostTeacher = "기록 없음";
    let maxTeacherCount = 0;
    Object.entries(state.history.teachers).forEach(([name, count]) => {
        if (count > maxTeacherCount) {
            maxTeacherCount = count;
            mostTeacher = name;
        }
    });
    
    let resultTitle = "", personality = "", lesson = "";

    if (maxStat.key === 'coding' && s.coding > 80) {
        resultTitle = `전설의 유니콘 개발자`;
        personality = "밤낮 없는 코딩으로 이미 실무 레벨을 뛰어넘었습니다. 실리콘밸리에서 연락이 올지도 모릅니다.";
        lesson = "코드는 정직하다. 짠 만큼 결과가 나온다.";
    } else if (maxStat.key === 'academic' && s.academic > 80) {
        resultTitle = `수석 졸업의 영예`;
        personality = "디미고의 모든 시험을 정복했습니다. 학문적 깊이가 남다르며 선생님들의 자랑입니다.";
        lesson = "배움에는 끝이 없다.";
    } else if (maxStat.key === 'mental' && s.mental > 80) {
        resultTitle = `해탈한 철학자`;
        personality = "어떤 고난과 에러에도 평정심을 유지합니다. 제제쌤의 진정한 후계자일지도 모릅니다.";
        lesson = "모든 것은 마음먹기에 달렸다.";
    } else if (maxStat.key === 'social' && s.social > 80) {
        resultTitle = `디미고 마당발`;
        personality = "학교의 모든 소식을 알고 있으며, 주변에는 항상 친구들이 넘칩니다. 리더십이 뛰어납니다.";
        lesson = "함께 가면 멀리 간다.";
    } else {
        resultTitle = `평범하지만 소중한 졸업생`;
        personality = "적절한 밸런스를 유지하며 30일간의 여정을 무사히 마쳤습니다. 앞으로의 가능성이 무궁무진합니다.";
        lesson = "중요한 건 꺾이지 않는 마음.";
    }

    return { resultTitle, personality, lesson, maxStat, mostAction, mostTeacher };
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
        const analysis = getEndingAnalysis();
        container.innerHTML = `
            <div class="screen-full animate-in" style="justify-content: flex-start; overflow-y: auto; padding-bottom: 2rem;">
                <div class="logo-header" style="margin-top: 1rem;">
                    <div class="logo-symbol">🎓</div>
                    <div class="logo-text">
                        <span class="logo-text-top">GRADUATION</span>
                        <span class="logo-text-bottom">졸업 회고록</span>
                    </div>
                </div>
                
                <div style="margin: 1.5rem 0; padding: 1.5rem; background: #f8fafc; border-radius: 1.5rem; border: 1px solid #e2e8f0;">
                    <div style="font-size: 0.7rem; color: #E11D74; font-weight: 900; margin-bottom: 0.5rem;">FINAL STATUS: ${analysis.maxStat.name} 특화</div>
                    <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem;">${state.name}님은<br>"${analysis.resultTitle}"</h2>
                    <p style="font-size: 0.85rem; color: #64748b; line-height: 1.6;">${analysis.personality}</p>
                </div>

                <div style="background: white; padding: 1.2rem; border-radius: 1rem; border: 1px dashed #cbd5e1; margin-bottom: 1.5rem;">
                    <div style="font-size: 0.7rem; font-weight: 900; color: #1A1A1A; margin-bottom: 0.8rem; text-align: center;">📊 30일간의 활동 리포트</div>
                    <div style="display: flex; justify-content: space-around; text-align: center;">
                        <div>
                            <div style="font-size: 0.6rem; color: #64748b;">주된 활동</div>
                            <div style="font-weight: 900; font-size: 0.9rem;">${analysis.mostAction}</div>
                        </div>
                        <div style="width: 1px; background: #e2e8f0;"></div>
                        <div>
                            <div style="font-size: 0.6rem; color: #64748b;">최애 선생님</div>
                            <div style="font-weight: 900; font-size: 0.9rem;">${analysis.mostTeacher}</div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.5rem;">
                    <div style="background: #1A1A1A; color: white; padding: 1rem; border-radius: 1rem; text-align: left;">
                        <div style="font-size: 0.6rem; opacity: 0.7;">CODING</div>
                        <div style="font-size: 1.2rem; font-weight: 900;">${state.stats.coding}</div>
                    </div>
                    <div style="background: #E11D74; color: white; padding: 1rem; border-radius: 1rem; text-align: left;">
                        <div style="font-size: 0.6rem; opacity: 0.7;">ACADEMIC</div>
                        <div style="font-size: 1.2rem; font-weight: 900;">${state.stats.academic}</div>
                    </div>
                </div>

                <div style="padding: 1.5rem; border-left: 4px solid #E11D74; background: #fff1f6; border-radius: 0.5rem; text-align: left; margin-bottom: 2rem;">
                    <div style="font-size: 0.6rem; font-weight: 900; color: #E11D74; margin-bottom: 0.3rem;">LIFE LESSON</div>
                    <div style="font-weight: 700; color: #1A1A1A;">"${analysis.lesson}"</div>
                </div>

                <button onclick="state.gameState='START';render();" class="btn-main">다시 입학하기</button>
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