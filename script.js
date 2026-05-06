/**
 * 디미고 학생 키우기 - 엔딩 회고 시스템 강화 버전
 */

const INITIAL_STATS = { coding: 20, academic: 20, stamina: 80, mental: 80, social: 20, money: 50 };

const ACTIONS = [
    { id: 'coding', name: '코딩 공부', icon: 'code', color: '#1A1A1A', effect: { coding: 8, mental: -4, stamina: -4 } },
    { id: 'study', name: '시험 공부', icon: 'book-open', color: '#E11D74', effect: { academic: 8, mental: -5, stamina: -3 } },
    { id: 'exercise', name: '운동하기', icon: 'dumbbell', color: '#475569', effect: { stamina: 10, mental: 5, coding: -1 } },
    { id: 'hangout', name: '친구와 놀기', icon: 'users', color: '#E11D74', effect: { social: 8, mental: 8, money: -5 } },
    { id: 'sleep', name: '푹 자기', icon: 'moon', color: '#1A1A1A', effect: { stamina: 15, mental: 10, academic: -1 } }
];

const TEACHERS = {
    PRESIDENT: {
        name: "남승완", role: "교장선생님", emoji: "👴",
        intro: "허허, 우리 학생... 학교 생활은 할 만한가?",
        events: [{
            text: "교장실 앞을 지나가다 교장선생님을 마주쳤습니다. 훈화 말씀이 시작되려 합니다.",
            options: [
                { label: "끝까지 경청하며 고개를 끄덕인다.", effect: { mental: -15, social: 15, academic: 5 }, msg: "귀가 너무 아프다...." },
                { label: "급한 일이 있는 척 도망간다.", effect: { social: -10, mental: 10 }, msg: "저 친구 생기부 줘봐" }
            ]
        }]
    },
    VICE_PRESIDENT: {
        name: "교감선생님", role: "교감선생님", emoji: "👨‍🏫",
        intro: "우리 학교의 전통에 따라 애국가는 4절까지 부릅니다.",
        quiz: [
            { q: "애국가 4절: 이 기상과 이 (  )으로 충성을 다하여", a: "맘" },
            { q: "애국가 4절: (  ) 즐거우나 나라 사랑하세", a: "괴로우나" }
        ]
    },
    MATH_HANG: {
        name: "행수쌤", role: "수학선생님", emoji: "📐",
        intro: "자, 행~~~수!",
        events: [{
            text: "복도에서 행수쌤이 갑자기 나머지정리 문제를 물어보십니다.",
            options: [
                { label: "행 siuuuu", effect: { academic: 12, mental: 5 }, msg: "아주 좋아! 행 siuuuuuuuu" },
                { label: "모르겠다고 답한다.", effect: { mental: -5, academic: -2 }, msg: "선생님 삐졌어! 흥!" }
            ]
        }]
    },
    MATH_BYUK: {
        name: "병혁쌤", role: "수학선생님", emoji: "⚡",
        intro: "팩토리얼!!! 인생은 확률과 통계야!",
        events: [{
            text: "병혁쌤이 열정적으로 팩토리얼의 중요성을 설명하십니다. 당신의 열정은?",
            options: [
                { label: "팩토리얼!!! 같이 외친다.", effect: { mental: 15, social: 10, stamina: -5 }, msg: "아주 좋아! 랄라라" },
                { label: "조용히 수학 정석 책을 핀다.", effect: { academic: 10 }, msg: "음, 성실하구먼." }
            ]
        }]
    },
    ENGLISH_YU: {
        name: "전유원(check!)", role: "영어선생님", emoji: "🇺🇸",
        intro: "안녕 4반~!",
        quiz: [
            { q: "Enthusiasm", a: "열정" },
            { q: "Achievement", a: "성취" },
            { q: "Challenge", a: "도전" }
        ]
    },
    CS_HAM: {
        name: "하미영(크롱러버)", role: "정보기술선생님", emoji: "💻",
        intro: "자, 지옥의 코딩 시간입니다.",
        events: [{
            text: "하미영 선생님의 지옥의 코딩 수업! 엄청난 양의 과제가 쏟아집니다.",
            options: [
                { label: "영혼을 갈아 넣어 끝까지 듣는다.", effect: { coding: 25, stamina: -50, mental: -10 }, msg: "코딩 실력이 폭발적으로 상승했습니다!" },
                { label: "몰래 눈을 붙이고 잔다.", effect: { stamina: 10, coding: -5, social: -5 }, msg: "잠깐의 휴식을 얻었습니다." }
            ]
        }]
    }
};

let state = {
    gameState: 'START',
    day: 1,
    name: '',
    stats: { ...INITIAL_STATS },
    log: null,
    currentEvent: null,
    recentTeachers: [],
    // 회고를 위한 기록 데이터
    history: {
        actions: [], // [{day, actionId}]
        events: [],  // [{day, teacherName, result}]
        dailyStats: [] // [{day, stats}]
    }
};

const clamp = (v) => Math.min(100, Math.max(0, v));

function startGame() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) return;
    state = {
        gameState: 'PLAYING',
        day: 1,
        name: name,
        stats: { ...INITIAL_STATS },
        log: null,
        currentEvent: null,
        recentTeachers: [],
        history: { actions: [], events: [], dailyStats: [] }
    };
    render();
}

function handleAction(id) {
    const action = ACTIONS.find(a => a.id === id);
    let ns = { ...state.stats };
    let log = { actionName: action.name, effects: [] };

    Object.entries(action.effect).forEach(([k, v]) => {
        ns[k] = clamp(ns[k] + v);
        log.effects.push({ key: k, val: v });
    });

    state.stats = ns;
    state.log = log;
    
    // 기록 저장
    state.history.actions.push({ day: state.day, actionId: id });
    state.history.dailyStats.push({ day: state.day, stats: { ...ns } });

    if (Math.random() < 0.45) {
        triggerTeacherEvent();
    } else {
        nextDay();
    }
}

function triggerTeacherEvent() {
    const allTeacherKeys = Object.keys(TEACHERS);
    let availableKeys = allTeacherKeys.filter(key => !state.recentTeachers.includes(key));
    if (availableKeys.length === 0) availableKeys = allTeacherKeys;

    const selectedKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    const teacher = TEACHERS[selectedKey];
    
    state.recentTeachers.push(selectedKey);
    if (state.recentTeachers.length > 2) state.recentTeachers.shift();

    state.currentEvent = {
        teacher: teacher,
        type: teacher.quiz ? 'QUIZ' : 'DIALOG',
        data: teacher.quiz ? teacher.quiz[Math.floor(Math.random() * teacher.quiz.length)] : teacher.events[0]
    };
    render();
}

function solveDialog(optionIdx) {
    const { teacher, data } = state.currentEvent;
    const option = data.options[optionIdx];
    
    Object.entries(option.effect).forEach(([k, v]) => {
        state.stats[k] = clamp(state.stats[k] + v);
    });

    state.history.events.push({ day: state.day, teacherName: teacher.name, result: option.msg });
    state.log = { actionName: `선생님: ${option.msg}`, effects: Object.entries(option.effect).map(([k, v]) => ({ key: k, val: v })) };
    state.currentEvent = null;
    nextDay();
}

function solveQuiz() {
    const { teacher, data } = state.currentEvent;
    const input = document.getElementById('quiz-ans').value.trim();
    const isCorrect = input === data.a;

    let resMsg = "";
    if (isCorrect) {
        state.stats.academic = clamp(state.stats.academic + 10);
        resMsg = "성공적으로 문제를 해결했습니다.";
    } else {
        state.stats.mental = clamp(state.stats.mental - 10);
        resMsg = `오답을 말해 아쉬움을 남겼습니다. (정답: ${data.a})`;
    }

    state.history.events.push({ day: state.day, teacherName: teacher.name, result: resMsg });
    state.log = { actionName: teacher.name + ": " + (isCorrect ? "훌륭하다!" : "더 공부하도록!"), effects: [{ key: isCorrect ? 'academic' : 'mental', val: isCorrect ? 10 : -10 }] };
    state.currentEvent = null;
    nextDay();
}

function nextDay() {
    if (state.day >= 30) {
        state.gameState = 'ENDING';
    } else {
        state.day++;
    }
    render();
}

// --- 엔딩 분석 로직 ---
function getEndingAnalysis() {
    const s = state.stats;
    const h = state.history;

    // 1. 결과 문장 및 성향 분석
    let resultTitle = "";
    let personality = "";
    let lesson = "";

    const maxStat = Object.keys(s).reduce((a, b) => s[a] > s[b] ? a : b);
    
    switch(maxStat) {
        case 'coding':
            resultTitle = `${state.name}님은 디미고 생활을 마치고, 세상을 바꾸는 개발자가 되었습니다.`;
            personality = "당신은 문제를 끝까지 해결하는 개발자형 학생이었습니다.";
            lesson = "성장은 선택의 합이다.";
            break;
        case 'academic':
            resultTitle = `${state.name}님은 디미고 생활을 마치고, 꾸준함을 무기로 삼는 연구자가 되었습니다.`;
            personality = "당신은 성실하게 목표를 쌓아가는 노력형 학생이었습니다.";
            lesson = "균형 잡힌 하루가 결국 좋은 미래를 만든다.";
            break;
        case 'social':
            resultTitle = `${state.name}님은 디미고 생활을 마치고, 친구들과 함께 문제를 해결하는 창업가가 되었습니다.`;
            personality = "당신은 사람들과 함께 성장하는 협력형 학생이었습니다.";
            lesson = "혼자 잘하는 것보다 함께 성장하는 것이 더 오래간다.";
            break;
        case 'mental':
            resultTitle = `${state.name}님은 디미고 생활을 마치고, 많은 사람에게 사랑받는 동아리 리더가 되었습니다.`;
            personality = "당신은 흔들려도 다시 회복하는 안정형 학생이었습니다.";
            lesson = "노력도 중요하지만, 쉬는 것도 실력이다.";
            break;
        default:
            resultTitle = `${state.name}님은 자신을 돌보는 법을 배운 사람이 되었습니다.`;
            personality = "당신은 균형을 중요시하는 학생이었습니다.";
            lesson = "포기하지 않는 마음이 가장 큰 무기다.";
    }

    // 2. 행동 요약 (TOP 3)
    const actionCounts = h.actions.reduce((acc, curr) => {
        acc[curr.actionId] = (acc[curr.actionId] || 0) + 1;
        return acc;
    }, {});
    const sortedActions = Object.entries(actionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => ({ name: ACTIONS.find(act => act.id === id).name, count }));

    // 3. 만난 인물/사건 횟수
    const eventSummary = h.events.reduce((acc, curr) => {
        acc[curr.teacherName] = (acc[curr.teacherName] || 0) + 1;
        return acc;
    }, {});

    // 4. 타임라인 선정 (주요 5일)
    const timeline = [];
    if (h.actions.length > 0) timeline.push({ day: 1, text: "디미고에서의 첫걸음을 내디뎠습니다." });
    
    // 이벤트가 있었던 날 중 중간 지점 선정
    const midEvents = h.events.filter(e => e.day > 5 && e.day < 25);
    if (midEvents.length > 0) {
        const sample = midEvents[Math.floor(midEvents.length / 2)];
        timeline.push({ day: sample.day, text: `${sample.teacherName} 선생님과의 만남이 인상 깊었습니다.` });
    }
    
    // 특정 스탯이 크게 변한 날 (임의 15일경)
    timeline.push({ day: 15, text: "학교 생활의 반환점을 돌며 목표를 다잡았습니다." });
    timeline.push({ day: 25, text: "졸업을 앞두고 마지막 스퍼트를 올렸습니다." });
    timeline.push({ day: 30, text: "마지막 선택까지 마치고 자신만의 길을 결정했습니다." });

    return { resultTitle, personality, lesson, sortedActions, eventSummary, timeline };
}

// --- 렌더링 ---
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
                <p style="margin-bottom:1.5rem; font-size:0.9rem; color:var(--slate-500);">30일간의 기록, 당신은 어떤 졸업생이 될까요?</p>
                <input type="text" id="name-input" class="input-name" placeholder="학생 이름을 입력하세요">
                <button onclick="startGame()" class="btn-main">신입생 입학</button>
            </div>
        `;
    } else if (state.gameState === 'PLAYING') {
        container.innerHTML = `
            <div class="content-area">
                <div class="top-bar">
                    <div>
                        <div style="font-size:0.6rem; color:var(--dm-pink); font-weight:900;">DAY ${state.day}/30</div>
                        <div style="font-size:1.2rem; font-weight:900;">${state.name} 학생</div>
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
                                ${state.log.effects.map(e => `<span style="font-size:0.6rem; color:${e.val > 0 ? 'var(--dm-pink)' : '#666'}">${e.key} ${e.val > 0 ? '+' : ''}${e.val}</span>`).join('')}
                            </div>
                        </div>
                    ` : '<div style="text-align:center; color:#ccc; margin-top:3rem;">학교 생활을 시작하세요!</div>'}
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
            <div class="screen-full animate-in" style="display:block; overflow-y:auto; text-align:left; padding:2rem 1.5rem;">
                <h1 style="font-size:1.5rem; font-weight:900; color:var(--dm-pink); text-align:center; margin-bottom:2rem;">졸업 회고록</h1>
                
                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.5rem;">최종 결과</h3>
                    <p style="font-size:1.1rem; font-weight:700; line-height:1.5; color:var(--dm-black);">${analysis.resultTitle}</p>
                </section>

                <section style="margin-bottom:2rem; background:var(--slate-50); padding:1rem; border-radius:1rem;">
                    <h3 style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.8rem;">나의 30일 요약</h3>
                    ${analysis.sortedActions.map((a, i) => `
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.9rem;">
                            <span>${i+1}. ${a.name}</span>
                            <span style="font-weight:700;">${a.count}회</span>
                        </div>
                    `).join('')}
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.5rem;">성장 분석</h3>
                    <p style="font-size:0.95rem; font-weight:600; color:var(--dm-pink);">${analysis.personality}</p>
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.8rem;">함께한 선생님들</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                        ${Object.entries(analysis.eventSummary).map(([name, count]) => `
                            <div style="background:white; border:1px solid var(--slate-200); padding:0.4rem 0.8rem; border-radius:2rem; font-size:0.8rem;">
                                <b>${name}</b> ${count}회
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.8rem;">인생 회고 타임라인</h3>
                    <div style="border-left:2px solid var(--slate-200); padding-left:1rem; margin-left:0.5rem;">
                        ${analysis.timeline.map(t => `
                            <div style="position:relative; margin-bottom:1rem;">
                                <div style="position:absolute; left:-1.35rem; top:0.3rem; width:0.6rem; height:0.6rem; background:var(--dm-pink); border-radius:50%;"></div>
                                <div style="font-size:0.7rem; color:var(--dm-pink); font-weight:800;">DAY ${t.day}</div>
                                <div style="font-size:0.85rem;">${t.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <div style="text-align:center; padding:2rem 0; border-top:1px dashed var(--slate-200);">
                    <p style="font-size:0.8rem; color:var(--slate-400); margin-bottom:0.5rem;">마지막 한 줄 교훈</p>
                    <p style="font-size:1.1rem; font-weight:900; color:var(--dm-black);">"${analysis.lesson}"</p>
                </div>

                <button onclick="state.gameState='START';render();" class="btn-main" style="margin-top:1rem;">처음으로 돌아가기</button>
            </div>
        `;
    }
    lucide.createIcons();
}

function renderStat(label, value, color) {
    return `<div><div class="stat-header"><span>${label}</span><span>${value}</span></div><div class="progress-bg"><div class="progress-fill" style="width:${value}%; background:${color}"></div></div></div>`;
}

function renderModal() {
    const ev = state.currentEvent;
    const { teacher, type, data } = ev;
    let content = '';
    if (type === 'DIALOG') {
        content = `
            <p class="dialog-text">${data.text}</p>
            <div class="option-list">
                ${data.options.map((opt, i) => `<button class="option-btn" onclick="solveDialog(${i})">${opt.label}</button>`).join('')}
            </div>
        `;
    } else {
        const placeholder = teacher.name === "교감선생님" ? "가사 입력" : "정답 입력";
        content = `
            <p class="dialog-text"><b>[ ${data.q} ]</b></p>
            <input type="text" id="quiz-ans" class="quiz-input" placeholder="${placeholder}">
            <button class="btn-main" onclick="solveQuiz()">정답 제출</button>
        `;
    }
    return `<div class="modal-overlay"><div class="dialog-box animate-in"><div class="teacher-info"><div class="teacher-avatar">${teacher.emoji}</div><div><div class="teacher-name">${teacher.name}</div><div class="teacher-role">${teacher.role}</div></div></div><div style="font-style:italic; color:var(--slate-400); font-size:0.8rem;">"${teacher.intro}"</div><div class="dialog-content">${content}</div></div></div>`;
}

window.onload = render;