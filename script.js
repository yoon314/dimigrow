/**
 * 디미고 학생 키우기 - 제제쌤 및 히든 이벤트 업데이트
 */

const INITIAL_STATS = { coding: 20, academic: 20, stamina: 80, mental: 80, social: 20, money: 50 };

const ACTIONS = [
    { id: 'coding', name: '코딩 공부', icon: 'code', color: '#1A1A1A', effect: { coding: 8, mental: -4, stamina: -4 } },
    { id: 'study', name: '시험 공부', icon: 'book-open', color: '#E11D74', effect: { academic: 8, mental: -5, stamina: -3 } },
    { id: 'exercise', name: '운동하기', icon: 'dumbbell', color: '#475569', effect: { stamina: 10, mental: 5, coding: -1 } },
    { id: 'hangout', name: '친구와 놀기', icon: 'users', color: '#E11D74', effect: { social: 8, mental: 8, money: -5 } },
    { id: 'sleep', name: '푹 자기', icon: 'moon', color: '#1A1A1A', effect: { stamina: 15, mental: 10, academic: -1 } }
];

const TEACHER_STORIES = {
    JEJE: {
        name: "제제쌤", role: "사회선생님", emoji: "🧘",
        episodes: [
            {
                intro: "안녕, 여러분. 오늘은 조금 깊은 이야기를 해볼까요?",
                text: "제제쌤이 칠판에 큰 글씨로 쓰십니다. '여러분들은 왜 사시나요?'",
                options: [
                    { label: "행복하기 위해서요!", effect: { mental: 15, social: 5 }, msg: "맞아요. 행복은 우리 삶의 가장 큰 이유죠." },
                    { label: "사랑하기 위해서요!", effect: { mental: 15, social: 10 }, msg: "아름다운 답변이네요. 사랑이 세상을 구원하니까요." }
                ]
            },
            {
                intro: "삶의 목적을 찾았다면, 이제 실천할 차례예요.",
                text: "사회 시간, 봉사활동과 공동체의 가치에 대해 토론이 벌어졌습니다.",
                options: [
                    { label: "타인을 돕는 기쁨에 대해 발표한다.", effect: { social: 15, mental: 5 }, msg: "선생님이 당신의 따뜻한 마음씨를 칭찬하십니다." },
                    { label: "조용히 경청하며 생각에 잠긴다.", effect: { mental: 10, academic: 5 }, msg: "내면이 한 층 더 성숙해지는 기분입니다." }
                ]
            },
            {
                // 히든 이벤트 로직은 triggerEvent에서 처리 (확률적 발생)
                intro: "오늘 날씨가 참 좋네요. 여러분과 나누고 싶은 게 있어요.",
                text: "수업 대신 제제쌤과 함께하는 명상 시간이 시작됩니다.",
                options: [
                    { label: "깊은 명상에 빠진다.", effect: { mental: 20, stamina: 10 }, msg: "정신이 맑아지고 활력이 생겼습니다." },
                    { label: "몰래 어젯밤 코딩 한 걸 생각한다.", effect: { coding: 10, mental: -5 }, msg: "선생님과 눈이 마주쳐 뜨끔했습니다." }
                ]
            }
        ]
    },
    PRESIDENT: {
        name: "남승완", role: "교장선생님", emoji: "👴",
        episodes: [
            {
                intro: "허허, 신입생인가? 학교가 참 넓지?",
                text: "교장선생님이 학교의 역사에 대해 말씀하시려 합니다.",
                options: [
                    { label: "경청하며 질문한다.", effect: { social: 10, mental: -10 }, msg: "교장선생님이 당신의 이름을 외우셨습니다!" },
                    { label: "졸음을 참는다.", effect: { mental: -5, stamina: -5 }, msg: "간신히 훈화 말씀이 끝났습니다." }
                ]
            }
        ]
    },
    CS_HAM: {
        name: "하미영", role: "정보기술선생님", emoji: "💻",
        episodes: [
            {
                intro: "자, 지옥의 코딩 시간입니다.",
                text: "첫 수업부터 과제가 산더미입니다.",
                options: [
                    { label: "밤을 새워 제출한다.", effect: { coding: 20, stamina: -40 }, msg: "선생님이 당신의 근성을 눈여겨보십니다." },
                    { label: "적당히 타협해서 낸다.", effect: { coding: 5, stamina: 10 }, msg: "무난하게 넘어갔습니다." }
                ]
            }
        ]
    }
};

const QUIZ_TEACHERS = {
    VICE_PRESIDENT: {
        name: "교감선생님", role: "교감선생님", emoji: "👨‍🏫",
        intro: "애국가는 4절까지!",
        quiz: [{ q: "애국가 4절: 이 기상과 이 (  )으로 충성을 다하여", a: "맘" }]
    },
    ENGLISH_YU: {
        name: "전유원", role: "영어선생님", emoji: "🇺🇸",
        intro: "Voca Check!",
        quiz: [{ q: "Enthusiasm", a: "열정" }]
    }
};

let state = {
    gameState: 'START',
    day: 1,
    name: '',
    stats: { ...INITIAL_STATS },
    log: null,
    currentEvent: null,
    history: { actions: [], events: [], dailyStats: [] },
    meetCount: {}
};

function startGame() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) return;
    state = {
        gameState: 'PLAYING', day: 1, name: name,
        stats: { ...INITIAL_STATS }, log: null, currentEvent: null,
        history: { actions: [], events: [], dailyStats: [] },
        meetCount: {}
    };
    render();
}

function handleAction(id) {
    const action = ACTIONS.find(a => a.id === id);
    let ns = { ...state.stats };
    let log = { actionName: action.name, effects: [] };

    Object.entries(action.effect).forEach(([k, v]) => {
        ns[k] = Math.min(100, Math.max(0, ns[k] + v));
        log.effects.push({ key: k, val: v });
    });

    state.stats = ns;
    state.log = log;
    state.history.actions.push({ day: state.day, actionId: id });
    state.history.dailyStats.push({ day: state.day, stats: { ...ns } });

    if (Math.random() < 0.5) triggerEvent();
    else nextDay();
}

function triggerEvent() {
    const storyKeys = Object.keys(TEACHER_STORIES);
    const quizKeys = Object.keys(QUIZ_TEACHERS);
    const isQuiz = Math.random() < 0.3;

    if (isQuiz) {
        const key = quizKeys[Math.floor(Math.random() * quizKeys.length)];
        const teacher = QUIZ_TEACHERS[key];
        state.currentEvent = {
            teacher, type: 'QUIZ',
            data: teacher.quiz[Math.floor(Math.random() * teacher.quiz.length)]
        };
    } else {
        const key = storyKeys[Math.floor(Math.random() * storyKeys.length)];
        const teacher = TEACHER_STORIES[key];
        const count = state.meetCount[key] || 0;

        // 제제쌤 히든 이벤트 체크 (3번째 만남 이상일 때 30% 확률)
        if (key === 'JEJE' && count >= 2 && Math.random() < 0.3) {
            state.currentEvent = {
                teacher, type: 'HIDDEN',
                key,
                data: {
                    intro: "쉿, 이건 우리끼리 비밀이에요.",
                    text: "제제쌤이 고생하는 여러분을 위해 아이스크림을 쏘셨습니다! '와'와 '설레임' 중 무엇을 먹을까요?",
                    options: [
                        { label: "와 (시원함 가득)", effect: { mental: 30, stamina: 20 }, msg: "머리가 띵할 정도로 시원합니다! 행복지수 폭발!" },
                        { label: "설레임 (달콤함 가득)", effect: { mental: 30, social: 15 }, msg: "친구들과 나눠 먹으니 기분이 최고예요!" }
                    ]
                }
            };
        } else {
            const episodeIdx = Math.min(count, teacher.episodes.length - 1);
            const episode = teacher.episodes[episodeIdx];
            state.currentEvent = { teacher, type: 'DIALOG', data: episode, key };
        }
    }
    render();
}

function solveDialog(idx) {
    const { teacher, data, key, type } = state.currentEvent;
    const option = data.options[idx];
    
    Object.entries(option.effect).forEach(([k, v]) => {
        state.stats[k] = Math.min(100, Math.max(0, state.stats[k] + v));
    });

    state.meetCount[key] = (state.meetCount[key] || 0) + 1;
    
    const eventPrefix = type === 'HIDDEN' ? '[★히든 이벤트★] ' : `[${teacher.name}] `;
    state.history.events.push({ day: state.day, teacherName: teacher.name, result: option.msg });
    state.log = { actionName: eventPrefix + option.msg, effects: Object.entries(option.effect).map(([k, v]) => ({ key: k, val: v })) };
    state.currentEvent = null;
    nextDay();
}

function solveQuiz() {
    const { teacher, data } = state.currentEvent;
    const input = document.getElementById('quiz-ans').value.trim();
    const isCorrect = input === data.a;

    if (isCorrect) {
        state.stats.academic = Math.min(100, state.stats.academic + 12);
        state.log = { actionName: `${teacher.name}: 정답이다!`, effects: [{ key: 'academic', val: 12 }] };
    } else {
        state.stats.mental = Math.max(0, state.stats.mental - 10);
        state.log = { actionName: `${teacher.name}: 틀렸어. 정답은 '${data.a}'야.`, effects: [{ key: 'mental', val: -10 }] };
    }

    state.history.events.push({ day: state.day, teacherName: teacher.name, result: isCorrect ? "퀴즈 성공" : "퀴즈 실패" });
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
    const h = state.history;
    const maxStat = Object.keys(s).reduce((a, b) => s[a] > s[b] ? a : b);
    
    let resultTitle = "", personality = "", lesson = "";

    if (maxStat === 'coding') {
        resultTitle = `${state.name}님은 세상을 바꾸는 개발자가 되었습니다.`;
        personality = "어떤 버그도 끝까지 잡아내는 집요한 개발자형 학생이었습니다.";
        lesson = "코드는 거짓말을 하지 않는다.";
    } else if (maxStat === 'academic') {
        resultTitle = `${state.name}님은 학계에서 인정받는 연구자가 되었습니다.`;
        personality = "책상 앞을 묵묵히 지킨 성실한 노력가형 학생이었습니다.";
        lesson = "축적의 시간이 성장을 만든다.";
    } else if (maxStat === 'social') {
        resultTitle = `${state.name}님은 최고의 팀워크를 이끄는 리더가 되었습니다.`;
        personality = "주변 사람들을 챙기며 함께 걷는 협력형 학생이었습니다.";
        lesson = "빨리 가려면 혼자 가고, 멀리 가려면 함께 가라.";
    } else if (maxStat === 'mental') {
        resultTitle = `${state.name}님은 제제쌤처럼 따뜻한 마음을 가진 상담가가 되었습니다.`;
        personality = "삶의 목적이 무엇인지 아는 지혜로운 학생이었습니다.";
        lesson = "우리는 행복하기 위해 삽니다.";
    } else {
        resultTitle = `${state.name}님은 단단한 내면을 가진 어른이 되었습니다.`;
        personality = "폭풍우 속에서도 평정심을 잃지 않는 안정형 학생이었습니다.";
        lesson = "가장 중요한 것은 꺾이지 않는 마음.";
    }

    const actionCounts = h.actions.reduce((acc, curr) => {
        acc[curr.actionId] = (acc[curr.actionId] || 0) + 1;
        return acc;
    }, {});
    const sortedActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
        .map(([id, count]) => ({ name: ACTIONS.find(act => act.id === id).name, count }));

    const eventSummary = h.events.reduce((acc, curr) => {
        acc[curr.teacherName] = (acc[curr.teacherName] || 0) + 1;
        return acc;
    }, {});

    const timeline = [
        { day: 1, text: "디미고에서의 첫 등교, 설렘과 긴장이 가득했습니다." },
        { day: 10, text: "어느덧 학교 생활에 익숙해지기 시작했습니다." },
        { day: 20, text: "자신만의 강점이 뚜렷해지는 시기를 보냈습니다." },
        { day: 30, text: "30일간의 대장정을 마치고 졸업을 맞이했습니다." }
    ];

    return { resultTitle, personality, lesson, sortedActions, eventSummary, timeline };
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
                <p style="margin-bottom:1.5rem; color:#64748b; font-size:0.9rem;">제제쌤의 아이스크림 이벤트를 찾아보세요!</p>
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
                    ` : '<div style="text-align:center; color:#ccc; margin-top:3rem;">오늘의 선택은?</div>'}
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
                <h1 style="font-size:1.5rem; font-weight:900; color:#E11D74; text-align:center; margin-bottom:2rem;">졸업 회고록</h1>
                
                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem;">최종 성장 결과</h3>
                    <p style="font-size:1.1rem; font-weight:700; line-height:1.5;">${analysis.resultTitle}</p>
                </section>

                <section style="margin-bottom:2rem; background:#f8fafc; padding:1rem; border-radius:1rem;">
                    <h3 style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.8rem;">나의 주요 활동 TOP 3</h3>
                    ${analysis.sortedActions.map((a, i) => `
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem; font-size:0.9rem;">
                            <span>${i+1}. ${a.name}</span>
                            <span style="font-weight:700;">${a.count}회</span>
                        </div>
                    `).join('')}
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem;">나의 학생 성향</h3>
                    <p style="font-size:0.95rem; font-weight:600; color:#E11D74;">${analysis.personality}</p>
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.8rem;">함께한 인연들</h3>
                    <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                        ${Object.entries(analysis.eventSummary).map(([name, count]) => `
                            <div style="background:white; border:1px solid #e2e8f0; padding:0.4rem 0.8rem; border-radius:2rem; font-size:0.8rem;">
                                <b>${name}</b> ${count}회
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section style="margin-bottom:2rem;">
                    <h3 style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.8rem;">인생 타임라인</h3>
                    <div style="border-left:2px solid #e2e8f0; padding-left:1rem; margin-left:0.5rem;">
                        ${analysis.timeline.map(t => `
                            <div style="position:relative; margin-bottom:1rem;">
                                <div style="position:absolute; left:-1.35rem; top:0.3rem; width:0.6rem; height:0.6rem; background:#E11D74; border-radius:50%;"></div>
                                <div style="font-size:0.7rem; color:#E11D74; font-weight:800;">DAY ${t.day}</div>
                                <div style="font-size:0.85rem;">${t.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <div style="text-align:center; padding:2rem 0; border-top:1px dashed #e2e8f0;">
                    <p style="font-size:1.1rem; font-weight:900;">"${analysis.lesson}"</p>
                </div>

                <button onclick="state.gameState='START';render();" class="btn-main" style="margin-top:1rem;">새로운 이름으로 입학하기</button>
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
        <p class="dialog-text">아래 빈칸의 정답은? <br><br><b>[ ${data.q} ]</b></p>
        <input type="text" id="quiz-ans" class="quiz-input" placeholder="정답 입력">
        <button class="btn-main" onclick="solveQuiz()">정답 제출</button>
    `;

    return `
        <div class="modal-overlay">
            <div class="dialog-box animate-in" style="${isHidden ? 'border:3px solid gold;' : ''}">
                <div class="teacher-info">
                    <div class="teacher-avatar" style="${isHidden ? 'background:lightyellow;' : ''}">${isHidden ? '🍦' : teacher.emoji}</div>
                    <div>
                        <div class="teacher-name">${isHidden ? '특별한 보상' : teacher.name}</div>
                        <div class="teacher-role">${isHidden ? '히든 이벤트' : teacher.role}</div>
                    </div>
                </div>
                <div style="font-style:italic; color:#94a3b8; font-size:0.8rem;">
                    "${data.intro}" 
                    ${!isHidden && state.meetCount[state.currentEvent.key] ? `(${state.meetCount[state.currentEvent.key]+1}번째 만남)` : ''}
                </div>
                <div class="dialog-content">${content}</div>
            </div>
        </div>`;
}

window.onload = render;