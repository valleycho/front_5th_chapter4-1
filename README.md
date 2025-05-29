## 🔗 배포 링크

- S3 버킷 웹사이트 URL
  - http://hanghae-valleycho-bucket.s3-website.ap-northeast-2.amazonaws.com/
- CloudFront 웹사이트 URL
  - https://d2g4ghv4jkjmqd.cloudfront.net/

<br><br>

## 🛠️ 프론트엔드 배포 워크플로우

### 📌 개요

<img width="600" alt="스크린샷 2025-05-27 오후 5 28 48" src="https://github.com/user-attachments/assets/e69bc693-fc2f-42c4-b387-bcae1a18ba63" />

1. 로컬에서 코드 변경 사항을 커밋한 후, `git push` 명령어를 통해 원격 저장소에 업로드
2. depoloyment.yml의 작성된 아래의 작업들 실행
   - ubuntu 환경에서 실행
   - 코드 저장소의 소스코드를 받아옴
   - `npm ci` 명령어로 프로젝트 의존성 설치
   - `npm run build` 명령어로 Next.js 프로젝트 빌드
   - AWS 자격 증명하기 위한 키값 작성
   - 빌드된 파일을 S3의 동기화
   - CloudFront의 캐시 무효화해서 업데이트
3. S3(정적 호스팅) 주소와 CloudFront 주소에 각각 접속하면, CDN이 적용되지 않은 버전과 적용된 버전의 홈페이지를 확인 가능

<br><br>

## 🧠 주요 개념

### 📚 1.GitHub Actions과 CI/CD 도구

**📓 1-1. GitHub Actions란?**  
코드 변경이 발생했을 때 자동으로 특정 작업(workflow)을 수행할 수 있도록 도와주는 도구

**GitHub Actions 구성 요소**

<details>
<summary><strong>Workflow</strong></summary>

- 자동화하고 싶은 전체 작업을 하나의 단위로 정의  
- .github/workflows/ 디렉토리에 .yml 파일로 저장

```yaml
/** deployment.yaml **/

name: CI

on:
 push:
  branches: [ main ]

jobs:
 build:
  runs-on: ubuntu-latest
   steps:
    - uses: actions/checkout@v3
    - name: Run tests
      run: npm test
```

</details>

<details>
<summary><strong>Event</strong></summary>

- Workflow를 언제 실행할지 정의

📂 1. 코드 관련 이벤트
| 이벤트 이름 | 설명 |
| --- | --- |
| `push` | 브랜치에 커밋이 푸시될 때 트리거됩니다. |
| `pull_request` | PR(pull request)이 열리거나 업데이트될 때 실행됩니다. |
| `pull_request_target` | PR의 **대상 저장소의 컨텍스트**로 실행됩니다 (보안 이슈 완화 목적). |
| `merge_group` | 병합 큐를 사용할 때, GitHub에서 PR을 병합하기 전에 테스트를 실행하는 데 사용됨 (GitHub Merge Queue 기능). |
| `create` | 브랜치나 태그가 새로 생성될 때 트리거됩니다. |
| `delete` | 브랜치나 태그가 삭제될 때 트리거됩니다. |
| `workflow_run` | 다른 워크플로우가 완료됐을 때 트리거됩니다. |

📝 **2. 이슈 및 PR 관련 이벤트**

| 이벤트 이름                   | 설명                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `issues`                      | 이슈가 열리거나, 닫히거나, 댓글이 달릴 때 등 다양한 액션에 반응 |
| `issue_comment`               | 이슈 또는 PR에 **댓글이 달릴 때** 트리거됩니다.                 |
| `pull_request_review`         | PR 리뷰가 등록, 수정, 삭제될 때 실행됩니다.                     |
| `pull_request_review_comment` | PR의 코드 줄에 리뷰 댓글이 달릴 때 실행됩니다.                  |
| `discussion`                  | Discussions 기능에서 토론이 생성/변경/닫힐 때 발생합니다.       |
| `discussion_comment`          | Discussions의 댓글 생성/수정/삭제 시 발생합니다.                |

🧑‍💻 **3.프로젝트 관리 이벤트**

| 이벤트 이름      | 설명                                                          |
| ---------------- | ------------------------------------------------------------- |
| `project`        | GitHub Projects에 새로운 프로젝트 생성 등 변경 발생 시 트리거 |
| `project_card`   | 카드가 추가/이동/삭제될 때                                    |
| `project_column` | 컬럼이 생성/이름 변경/삭제될 때                               |

👨‍👩‍👧‍👦 **4. 멤버/협업 관련 이벤트**

| 이벤트 이름    | 설명                                      |
| -------------- | ----------------------------------------- |
| `member`       | 저장소에 멤버가 추가되거나 삭제될 때 발생 |
| `membership`   | 팀에 유저가 추가되거나 삭제될 때          |
| `organization` | 사용자가 조직에 가입/탈퇴/제거될 때       |
| `team_add`     | 팀이 저장소에 추가될 때                   |

⚙️ **5. 워크플로우 및 릴리즈 관련 이벤트**

| 이벤트 이름           | 설명                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `workflow_dispatch`   | 사용자가 수동으로 워크플로우를 실행할 수 있게 해줍니다.                     |
| `repository_dispatch` | 외부 시스템이 GitHub API로 호출하여 트리거하는 사용자 정의 이벤트           |
| `workflow_call`       | 다른 워크플로우에서 이 워크플로우를 **함수처럼 호출**할 수 있도록 해줍니다. |
| `release`             | 릴리즈 생성, 편집, 게시, 삭제 등의 이벤트 발생 시 트리거                    |
| `package`             | GitHub Package Registry에서 패키지가 게시/수정/삭제될 때                    |

⏰ **6. 스케줄 기반 이벤트**

| 이벤트 이름 | 설명                                                               |
| ----------- | ------------------------------------------------------------------ |
| `schedule`  | cron 형식으로 정의된 일정에 따라 자동 실행됨<br>예: 매일 자정 실행 |

```yaml
on:
  schedule:
    - cron: "0 0 * * *" # 매일 자정
```

🖥️ **7. CI/CD 상태 이벤트**

| 이벤트 이름         | 설명                                                       |
| ------------------- | ---------------------------------------------------------- |
| `check_run`         | 체크 실행(create, update, complete) 이벤트 발생 시 트리거  |
| `check_suite`       | 전체 체크 스위트(create, complete, requested) 상태 변화 시 |
| `deployment`        | 배포 요청 발생 시 트리거                                   |
| `deployment_status` | 배포 상태 변경 시 트리거                                   |

✅ **요약 정리**

| 분류            | 주요 이벤트                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| **코드 변경**   | `push`, `pull_request`, `create`, `delete`                                         |
| **PR/이슈**     | `issues`, `issue_comment`, `pull_request_review`                                   |
| **관리 작업**   | `project`, `project_card`, `organization`                                          |
| **CI/CD**       | `workflow_dispatch`, `workflow_call`, `repository_dispatch`, `release`, `schedule` |
| **외부 트리거** | `repository_dispatch`, `workflow_dispatch`                                         |
| **상태 체크**   | `check_run`, `deployment_status`                                                   |

</details>

<details>
<summary><strong>Job</strong></summary>

- 하나의 독립된 실행 단위  
- 병렬 혹은 순차적으로 실행 가능

✅ **필수 필드**

| 키        | 설명                                                         |
| --------- | ------------------------------------------------------------ |
| `runs-on` | job이 실행될 OS 환경 (예: `ubuntu-latest`, `windows-latest`) |
| `steps`   | job 내에서 순차적으로 실행되는 명령 또는 액션 목록           |
| `name`    | job의 이름 (선택 사항, 주로 가독성을 위해 사용)              |

🔄 **여러 Job 간 관계 설정 (needs)**

job은 기본적으로 병렬 실행되지만, needs를 통해 의존 관계를 설정하면
순차 실행이 가능

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build job"

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - run: echo "Test job"

// test job이 build job이 완료된 후 실행

```

</details>

<details>
<summary><strong>Runner</strong></summary>
 - GitHub Actions에서 정의한 job들을 실제로 실행해주는 서버 또는 환경
<br>

**Runner의 종류**  
**1. 호스티드 러너 (GitHub-hosted runners)**

- GitHub에서 자동으로 제공해주는 가상 머신
- 워크플로우가 실행될 때마다 새로운 VM이 생성되고, 작업 후 제거됨

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

🟢 장점: 별도 관리 불필요, 즉시 사용 가능  
🔴 단점: 커스터마이징 불가, 실행 시간 제한 있음

<br>

**2. 셀프 호스티드 러너 (Self-hosted runners)**  
직접 자신의 서버나 VM에 GitHub Runner를 설치해서 사용

```yaml
jobs:
  build:
    runs-on: self-hosted
```

🟢 장점  
더 빠른 빌드 (캐싱 유지)  
고사양 머신 활용 가능  
네트워크 제약 없이 내부 시스템과 연동 가능

🔴 단점  
유지보수 필요 (업데이트, 보안, 죽은 프로세스 등)  
실행 격리 부족 시 보안 위험 가능

</details>

<details>
<summary><strong>Step</strong></summary>
- Job 안에서 실제로 명령어를 실행하는 단계
  
🧩  **Step의 구성 요소**
| 유형 | 설명 | 예시 |
| --- | --- | --- |
| **`run`** | 쉘 명령어를 직접 실행 | `run: echo "Hello"` |
| **`uses`** | 재사용 가능한 액션을 호출 | `uses: actions/checkout@v3` |

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - name: Run shell command
        run: echo "Hello World"

      - name: Use GitHub Action
        uses: actions/checkout@v3
```

</details>

<details>
<summary><strong>Action</strong></summary>
- Action은 GitHub Actions 워크플로우에서 재사용 가능한 기능 블록(코드 체크아웃, 테스트, 배포 등)을 패키징한 작은 프로그램)   
  
```yaml
// checkout@v3는 GitHub 저장소의 코드를 받아오는 액션
- uses: actions/checkout@v3
```

📦 **Action의 종류**

**1. Docker 액션**

- 모든 종속성을 격리된 환경에 설치 가능
- Docker 컨테이너 안에서 실행

```yaml
runs:
  using: docker
  image: Dockerfile
```

2. JavaScript 액션 (Node.js 런타임)

- 빠르고 경량. GitHub가 Node.js 런타임으로 실행

```yaml
runs:
  using: node16
  main: index.js
```

</details>

<br><br>

**📓 1-2. CI/CD 개념 및 도구**

**CI (Continuous Integration) - 지속적 통합**

- 개발자들이 자주(하루에도 여러 번) 코드를 **공용 저장소**에 병합
- 병합 시 자동으로 **빌드와 테스트**가 실행되어, 코드 품질을 유지
- 문제를 조기에 발견할 수 있어 개발 효율성이 높아짐

<br>

**CD (Continuous Delivery / Deployment)**

Continuous Delivery (지속적 전달)

- CI 이후, **테스트를 통과한 코드가 스테이징 환경에 자동 배포**됨
- 운영 환경 배포는 **수동 승인**이 필요함

Continuous Deployment (지속적 배포)

- 테스트를 통과하면 코드가 **자동으로 운영 환경에 배포**됨
- 완전한 자동화 파이프라인

🔧 **대표적인 CI/CD 도구**

| 도구                    | 설명                                          | 특징                                                 |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Jenkins**             | 가장 널리 사용되는 오픈소스 CI 서버           | 다양한 플러그인, 유연성, 복잡한 파이프라인 구축 가능 |
| **GitHub Actions**      | GitHub 저장소와 통합된 워크플로우 자동화 도구 | GitHub 친화적, YAML로 구성, 무료 요금제 있음         |
| **GitLab CI/CD**        | GitLab에 내장된 파이프라인 도구               | 저장소-이슈-배포까지 통합 관리                       |
| **CircleCI**            | 빠르고 설정이 간편한 클라우드 기반 CI/CD 도구 | 빠른 빌드, 병렬 처리 기능                            |
| **Travis CI**           | GitHub와 연동되는 간단한 CI/CD 서비스         | 오픈소스 프로젝트에 무료                             |
| **Bitbucket Pipelines** | Bitbucket에 내장된 CI/CD 기능                 | Atlassian 제품과 연동 (Jira, Trello 등)              |
| **Argo CD**             | 쿠버네티스용 GitOps 기반 CD 도구              | 쿠버네티스에 특화된 배포 자동화                      |
| **Spinnaker**           | Netflix에서 개발한 배포 전용 도구             | 복잡한 멀티 클라우드 배포에 적합                     |
| **Tekton**              | Kubernetes 기반 CI/CD 프레임워크              | 클라우드 네이티브에 적합                             |

<br><br>

### 📚 2. **S3와 스토리지**

**📓 2-1. 스토리지(Storage)란?** **스토리지**는 데이터를 저장하는 장치를 의미

🔹 종류

| 종류                  | 설명                                         | 예시                                     |
| --------------------- | -------------------------------------------- | ---------------------------------------- |
| **로컬 스토리지**     | 컴퓨터 또는 서버 내부에 직접 연결된 저장장치 | HDD, SSD                                 |
| **외부 스토리지**     | 네트워크를 통해 연결되는 저장장치            | NAS, SAN                                 |
| **클라우드 스토리지** | 인터넷을 통해 접근 가능한 저장소             | AWS S3, Google Cloud Storage, Dropbox 등 |

🔹 계층

| 계층                  | 특징                            | 사용 용도               |
| --------------------- | ------------------------------- | ----------------------- |
| **블록 스토리지**     | 고성능 I/O 처리                 | 데이터베이스, VM 디스크 |
| **파일 스토리지**     | 파일 단위 접근 (디렉터리 구조)  | 파일 공유, 문서 저장    |
| **오브젝트 스토리지** | 객체 단위 저장, 메타데이터 포함 | 이미지, 백업, 로그      |

<br>

**📓 2-2. Amazon S3(Amazon Simple Storage Service)란?** **Amazon S3**는 AWS에서 제공하는 **오브젝트 스토리지 서비스**

🔹 주요 특징

| 항목                  | 설명                                        |
| --------------------- | ------------------------------------------- |
| **오브젝트 스토리지** | 파일(객체), 메타데이터, 고유 키를 통해 저장 |
| **무제한 저장**       | 사실상 무제한 크기의 데이터를 저장 가능     |
| **높은 내구성**       | 99.999999999% (11 9's) 내구성               |
| **가용성**            | 고가용성을 위한 여러 지역 복제 기능         |
| **보안**              | IAM 정책, 버킷 정책, 암호화 지원            |
| **비용 효율**         | 사용한 만큼만 과금 (Pay-as-you-go)          |

<br><br>

### 📚 3. **CDN와 CloudFront**

**📓 3-1. CDN(Content Delivery Network)란?**
전 세계 여러 지역에 분산된 서버를 통해 웹 콘텐츠를 빠르고 효율적으로 전달하는 시스템

🌐 CDN 사용이유

- CDN 미사용시  
  서버가 한 곳에만 있으면, 멀리 있는 사용자일수록 응답 속도가 느려짐  
  트래픽이 많아질수록 서버 부하 증가, 속도 저하, 장애 발생  
  대규모 서비스는 글로벌 사용자에게 일관된 속도 제공이 어려움

- CDN 사용시  
  콘텐츠를 전 세계에 분산된 서버에 미리 저장해둠  
  사용자 위치에 따라 가장 가까운 서버에서 콘텐츠 제공  
  속도 향상, 서버 부하 감소, 보안 강화 등 효과

✍️ CDN 요약 정리
| 항목 | 설명 |
| ---------- | ---------------------------------------- |
| **정의** | 콘텐츠를 전 세계 엣지 서버에서 사용자에게 전달하는 네트워크 |
| **목적** | 빠른 콘텐츠 전송, 부하 분산, 보안 강화 |
| **주요 기능** | 캐싱, 압축, HTTPS, 보안, 분석 등 |
| **사용 예시** | 웹사이트, 앱, API, 영상 스트리밍 등 |
| **대표 서비스** | CloudFront, Cloudflare, Akamai, Fastly 등 |

<br>

**📓 3-2. Cloud Front란?**
AWS에서 제공하는 글로벌 CDN 서비스로, 웹 콘텐츠(HTML, CSS, JS, 이미지, 동영상, API 응답 등)를 지리적으로 가까운 엣지 서버에서 캐시하여 빠르게 제공하고,
동시에 보안과 확장성, 고가용성을 보장

**Cloud Front 주요 기능**

1. 정적 + 동적 콘텐츠 전송

   - 정적: 이미지, JS, CSS, HTML 등
   - 동적: 로그인, API 요청 등도 최적화하여 전달

2. HTTPS / TLS 지원

   - 무료 SSL 인증서(AWS Certificate Manager) 연동 가능
   - 커스텀 도메인(CNAME)도 지원

3. 캐시 제어

   - TTL(Time to Live), 캐시 정책 설정
   - 수동 캐시 무효화(Invalidation) 가능

4. 오리진 액세스 제어(OAC)

   - CloudFront만이 S3 버킷에 접근하도록 제한 가능 (보안 강화)

5. Signed URL / Cookie

   - 프라이빗 콘텐츠 보호 (유료 파일 다운로드, 강의 영상 등)

6. Geo Restriction

   - 국가별 접근 허용 또는 차단

7. AWS WAF 연동

   - 웹 방화벽을 통한 보안 룰 적용 (IP 차단, SQL Injection 방어 등)

8. Lambda@Edge
   - 엣지 위치에서 Lambda 함수를 실행해 동적으로 응답 수정 가능(A/B 테스트, 동적 리디렉션, 사용자 맞춤 응답)

<br><br>

### 📚 4. **캐시 무효화(Cache Invalidation)**

✅ **4-1. 캐시 무효화(Cache Invalidation)란?**  
CloudFront 엣지 서버에 캐시된 콘텐츠를 삭제(무효화)하는 작업입니다.  
이를 통해 기존 캐시된 오래된 파일 대신, 최신 콘텐츠로 사용자에게 응답하게 할 수 있습니다.

📦 **4-2. 왜 캐시 무효화가 필요한가?**  
CloudFront는 오리진(S3, EC2 등)에서 받아온 콘텐츠를 엣지 서버에 캐싱합니다.  
하지만 다음과 같은 경우 문제 발생

예시 상황: index.html 파일을 수정했는데, 사용자 브라우저에서는 여전히 이전 버전이 보임
예시 상황 이유: CloudFront 엣지 서버에 오래된 캐시가 남아있기 때문

📅 **4-3. 언제 캐시 무효화를 해야 하나?**
| 상황 | 캐시 무효화 필요 여부 |
| ---------------------------------- | ----------------- |
| 자주 변경되지 않는 정적 콘텐츠 (예: 이미지, JS) | ❌ 필요 없음 (TTL로 충분) |
| **HTML 페이지처럼 자주 변경되는 콘텐츠** | ✅ 무효화 필요 |
| 긴급 보안 패치, 잘못된 파일 업로드 | ✅ 무효화 필요 |
| 동일한 URL로 파일을 덮어쓴 경우 (버전 관리 안 했을 때) | ✅ 무효화 필요 |

🔧 **4-4. 캐시 무효화 방법**  
여러가지 방법이 있지만 CI/CD 파이프라인에서 배포 후 자동으로 무효화 작업을 넣는 것이 일반적

```yml
- name: Invalidate CloudFront cache
  run: |
    aws cloudfront create-invalidation --distribution-id
      ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

🔄 캐시 무효화 경로 조정
| 경로 예시 | 설명 |
| --------------- | ------------------ |
| `"/*"` | 전체 무효화 (주의: 비용 발생) |
| `"/index.html"` | 특정 파일만 무효화 |
| `"/static/*"` | 특정 디렉터리 하위 전체 무효화 |

<br><br>

### 📚 5. **Repository secret과 환경변수**

Repository Secrets는 비밀번호, API 키, 토큰 등 민감한 값을 안전하게 저장하고 사용하는 기능

✅ **5-1. Secrets의 용도**
| 예시 이름 | 설명 |
| ----------------------- | ---------------- |
| `AWS_ACCESS_KEY_ID` | AWS 접근 키 |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 |
| `DISTRIBUTION_ID` | CloudFront 배포 ID |
| `DATABASE_URL` | DB 접속 문자열 |

🌱 **5-2. 환경 변수 (Environment Variable)란?**  
스크립트나 빌드 도구에 전달되는 값으로, 설정 값이나 옵션 등을 코드에 하드코딩하지 않고 외부에서 주입하는 방식

```yaml
env:
  REGION: ap-northeast-2
  DEPLOY_DIR: ./dist
```

🔱 **Repository Secret과 Environment Variable 정리**
| 항목 | Repository Secret | Environment Variable |
| ----- | --------------------- | ---------------------------- |
| 목적 | 민감 정보 보호 | 일반 환경 설정 |
| 접근 방법 | `${{ secrets.NAME }}` | `$NAME` 또는 `${{ env.NAME }}` |
| 보안 | 암호화 + 로그 마스킹 | 로그에 노출될 수 있음 |
| 설정 위치 | GitHub 웹 UI | YAML 내부 또는 `.env` |

<br><br>

---

### 📚 6. **CDN과 성능최적화**

**📈 6-1. S3(정적 호스팅)과 Cloud Front(CDN) 성능 비교**

| **항목**           | **S3(정적 호스팅)** | **Cloud Front(CDN)** |
| ------------------ | ------------------- | -------------------- |
| **Performance**    | 🟢 100              | 🟢 100               |
| **Accessibility**  | 🟢 100              | 🟢 100               |
| **Best Practices** | 🟠 79               | 🟢 100               |
| **SEO**            | 🟢 100              | 🟢 100               |
| **FCP**            | **0.3 s**           | **0.2 s**            |
| **LCP**            | **0.6 s**           | **0.4 s**            |
| **TBT**            | **0 ms**            | **10 ms**            |
| **CLS**            | **0 ms**            | **0 ms**             |
| **Speed Index**    | **0.3 s**           | **0.2 s**            |

<details>
<summary><strong>Performance</strong></summary>

Lighthouse는 아래 6가지 핵심 지표를 기반으로 Performance 점수를 계산합니다.

| 지표                               | 설명                                                           | 가중치 |
| ---------------------------------- | -------------------------------------------------------------- | ------ |
| **First Contentful Paint (FCP)**   | 첫 콘텐츠(텍스트/이미지)가 보이기까지의 시간                   | 10%    |
| **Speed Index**                    | 전체 페이지가 얼마나 빠르게 렌더링되는지                       | 10%    |
| **Largest Contentful Paint (LCP)** | 가장 큰 콘텐츠(예: 큰 이미지, 텍스트)가 보이기까지 걸리는 시간 | 25%    |
| **Time to Interactive (TTI)**      | 사용자가 실제로 페이지와 상호작용할 수 있게 되는 시점          | 10%    |
| **Total Blocking Time (TBT)**      | 페이지가 사용자 입력에 응답하지 못한 총 시간 (JS 실행 지연)    | 30%    |
| **Cumulative Layout Shift (CLS)**  | 페이지 요소가 얼마나 많이/갑자기 이동하는지 (시각적 안정성)    | 15%    |

---

**점수 해석 기준**  
🟢 **매우 빠름:** 90 ~ 100  
🟡 **보통:** 50 ~ 89  
🔴 **느림:** 0 ~ 49

</details>

<details>
<summary><strong>Accessibility</strong></summary>

시각, 청각, 운동 능력, 인지 기능 등에 제한이 있는 사용자들도 웹사이트를 문제없이 이용할 수 있도록 하는 것

🔍 Lighthouse에서 점검하는 주요 항목
| 항목 | 설명 |
| ---------------------- | ---------------------------------------------- |
| **색 대비** | 텍스트와 배경 간의 명도 대비가 충분한가? |
| **이미지 대체 텍스트 (`alt`)** | 이미지에 의미 있는 `alt` 속성이 포함되어 있는가? |
| **HTML 구조 시맨틱** | 버튼, 링크 등은 시맨틱하게 마크업되어 있는가? (`<button>`, `<a>`) |
| **폼 라벨** | `<input>` 등 폼 요소에 명확한 `<label>`이 있는가? |
| **ARIA 속성 유효성** | `aria-*` 속성이 올바르게 사용되고 있는가? |
| **Tab 순서** | 키보드로 자연스럽게 이동 가능한가? (focus 순서 등) |
| **링크 명확성** | 링크가 "여기를 클릭하세요" 같은 모호한 텍스트가 아닌가? |
| **페이지 타이틀 존재** | `<title>` 태그가 존재하는가? |

</details>

<details>
<summary><strong>Best Practices</strong></summary>

웹사이트가 보안, 코드 안전성, API 사용 방식, 브라우저 호환성 등에서 문제가 없는지 자동으로 점검

🔍 Lighthouse에서 점검하는 주요 항목
| 검사 항목 | 설명 |
| ---------------------------- | ------------------------------------- |
| **HTTPS 사용** | 모든 리소스가 HTTPS로 안전하게 로드되어야 함 |
| **브라우저 API 사용 제한** | 위험한 API (예: `document.write`) 사용 여부 |
| **사용되지 않는 JS 제거** | 너무 많은 불필요한 자바스크립트 코드가 로딩되는지 |
| **콘솔 에러 여부** | 페이지에 JS 에러, 경고가 있는지 (`console.error`) |
| **Deprecated API 사용** | 더 이상 사용되지 않는 웹 API를 사용하는지 |
| **입력 필드에 자동완성 적용** | `autocomplete` 속성 누락 시 사용자 경험 저하 |
| **비디오에 캡션 존재 여부** | 접근성을 위한 자막 여부 확인 |
| **iframe 보안 속성 (`sandbox`)** | 외부 iframe이 보안상 안전하게 설정되었는지 |
| **자바스크립트 라이브러리 취약점 확인** | 사용하는 라이브러리에 알려진 보안 취약점이 있는지 |

</details>

<details>
<summary><strong>SEO</strong></summary>

구글 같은 검색 엔진에서 더 잘 노출될 수 있도록 구조화하는 기법

🔍 Lighthouse에서 점검하는 주요 항목
| 검사 항목 | 설명 |
| ---------------------------- | ------------------------------------- |
| **HTTPS 사용** | 모든 리소스가 HTTPS로 안전하게 로드되어야 함 |
| **브라우저 API 사용 제한** | 위험한 API (예: `document.write`) 사용 여부 |
| **사용되지 않는 JS 제거** | 너무 많은 불필요한 자바스크립트 코드가 로딩되는지 |
| **콘솔 에러 여부** | 페이지에 JS 에러, 경고가 있는지 (`console.error`) |
| **Deprecated API 사용** | 더 이상 사용되지 않는 웹 API를 사용하는지 |
| **입력 필드에 자동완성 적용** | `autocomplete` 속성 누락 시 사용자 경험 저하 |
| **비디오에 캡션 존재 여부** | 접근성을 위한 자막 여부 확인 |
| **iframe 보안 속성 (`sandbox`)** | 외부 iframe이 보안상 안전하게 설정되었는지 |
| **자바스크립트 라이브러리 취약점 확인** | 사용하는 라이브러리에 알려진 보안 취약점이 있는지 |

</details>

**FCP(First Contentful Paint): 사용자가 페이지를 로드했을 때, 브라우저가 처음으로 화면에 텍스트나 이미지 등 “콘텐츠”를 그리는 시점까지 걸리는 시간**

🎯 FCP가 측정하는 콘텐츠
| 포함됨 | 제외됨 |
| ---------------------- | ----------------------- |
| 텍스트 (`<h1>`, `<p>`, 등) | 빈 div, display: none 요소 |
| 이미지 (`<img>`) | 배경 이미지 (일반적으로 제외됨) |
| SVG, 캔버스 요소 | 비표시 콘텐츠 |
| `<canvas>` 등 | 비시각적 JS 실행 |

📈 FCP 성능 기준
| 점수 | 시간 |
| ------------ | ------------ |
| 🟢 좋음 | ≤ 1.8초 |
| 🟡 개선 필요 | 1.8 \~ 3.0초 |
| 🔴 느림 | ≥ 3.0초 |

🛠️ FCP 개선 방법
| 방법 | 설명 |
| -------------- | ------------------------------------- |
| ✅ 서버 응답 속도 개선 | TTFB 최적화, 캐싱 적용, CDN 활용 |
| ✅ CSS 최적화 | 렌더링 차단 CSS 최소화, Critical CSS 인라인 처리 |
| ✅ JS 지연 로딩 | `<script>`에 `defer`, `async` 속성 적용 |
| ✅ 이미지 최적화 | WebP 등 경량 포맷 사용, 사이즈 축소, preload 적용 |
| ✅ Web Font 최적화 | font-display: swap 적용, preload로 미리 로드 |
| ✅ SSR 도입 | SPA일 경우 서버 측 렌더링 적용해 초기 콘텐츠 빠르게 제공 |

<br>

**LCP(Largest Contentful Paint): 사용자가 페이지를 요청한 시점부터, 가장 크고 의미 있는 콘텐츠(예: 히어로 이미지, 큰 텍스트 블록 등)가 화면에 표시되기까지 걸리는 시간을 의미**

📦 LCP 측정 기준
| 요소 | 예시 |
| ------------- | ---------------------------------- |
| 이미지 (`<img>`) | 배너, 히어로 이미지 등 |
| 동영상 포스터 | `<video>`의 썸네일 |
| 배경 이미지 | CSS `background-image` (일부 조건에서) |
| 블록 텍스트 | `<h1>`, `<p>`, `<div>` 등 큰 텍스트 덩어리 |

✅ 의미 있는 시각 요소만 측정되며, invisible 요소, loading 상태 컴포넌트 등은 포함되지 않음.

📈 LCP 성능 기준
| 점수 | 시간 | 설명 |
| ------------ | ----------- | ----------- |
| 🟢 **좋음** | ≤ 2.5초 | 빠르게 콘텐츠 표시됨 |
| 🟡 **개선 필요** | 2.5 \~ 4.0초 | 일부 사용자에게 느림 |
| 🔴 **느림** | > 4.0초 | 느린 페이지로 인식됨 |

🛠️ LCP 최적화 방법
| 방법 | 설명 |
| ------------------ | ------------------------------------------ |
| ✅ 이미지 최적화 | WebP 포맷, 크기 축소, lazy load 아닌 preloading |
| ✅ Critical CSS 인라인 | LCP 콘텐츠를 위한 CSS는 바로 적용되도록 |
| ✅ `preload` 태그 사용 | `<link rel="preload" as="image">`로 미리 로드 |
| ✅ 서버 성능 개선 | 빠른 TTFB 확보 (캐싱, CDN 활용 등) |
| ✅ JS 비동기 처리 | `async`, `defer`, 코드 스플리팅 등 |
| ✅ SPA 초기 렌더 속도 개선 | LCP 요소를 서버 사이드 렌더링(SSR)하거나 hydration 지연 방지 |

<br>

**TBT(Total Blocking Time): 페이지가 로딩될 때, 브라우저 메인 스레드가 긴 작업 때문에 사용자 입력을 무시한 시간의 총합을 측정**

⏱️ TBT 계산 방법  
1.**브라우저의 메인 스레드가 50ms 이상 실행되는 "long task"**를 찾습니다.  
2.각 long task에서 50ms를 초과한 시간만 "차단 시간"으로 계산합니다.  
3.이 차단 시간을 모두 더한 것이 TBT입니다.

예시)
| 작업 | 실행 시간 | 차단 시간 (TBT) |
| ------- | ----- | ------------------- |
| JS 실행 A | 120ms | 120 - 50 = **70ms** |
| JS 실행 B | 80ms | 80 - 50 = **30ms** |
| CSS 계산 | 40ms | 0 (50ms 미만이므로 제외) |

➡️ 총 TBT = 70 + 30 = 100ms

📈 TBT 성능 기준
| 점수 | TBT 시간 | 의미 |
| -------- | -------------- | ----------------- |
| 🟢 좋음 | ≤ 200ms | 매우 반응 빠름 |
| 🟡 개선 필요 | 200ms \~ 600ms | 느릴 수 있음 |
| 🔴 나쁨 | > 600ms | 사용자 입력에 심각한 지연 발생 |

🛠️ TBT 개선 방법
| 전략 | 설명 |
| -------------------------- | ----------------------------------- |
| ✅ 코드 분할 (Code Splitting) | 필요한 페이지에서만 JS를 로딩 (React의 lazy 등) |
| ✅ Web Worker 활용 | 메인 스레드와 분리하여 무거운 작업 처리 |
| ✅ JS 최적화 | 복잡한 계산 로직 분해 또는 제거 |
| ✅ `requestIdleCallback` 사용 | 사용자 입력과 무관한 작업을 idle 시간에 실행 |
| ✅ 비동기 처리 | `async`, `defer` 속성을 `<script>`에 적용 |
| ✅ Third-party 최소화 | 꼭 필요한 외부 스크립트만 사용 |
| ✅ 이미지/폰트 Lazy Load | 초기 로딩 시 리소스 최소화 |

<br>

**CLS (Cumulative Layout Shift): CLS는 페이지가 로딩되는 동안**
요소들이 예고 없이 움직이는(shift) 현상이 얼마나 자주, 얼마나 많이 발생하는지를 수치로 나타낸 지표

🧮 CLS 점수 계산 방식
| 구성 요소 | 설명 |
| --------------------- | ------------------------------ |
| **Impact Fraction** | 화면에서 이동한 요소가 차지하는 비율 |
| **Distance Fraction** | 요소가 얼마나 멀리 이동했는지 (viewport 기준) |

⚠️ CLS는 여러 번 이동이 발생하면 각 이동 점수를 모두 더해 누적(Cumulative)됩니다.

📈 CLS 점수 기준
| 점수 | CLS 값 | 의미 |
| -------- | ----------- | ---------- |
| 🟢 좋음 | ≤ 0.1 | 시각적으로 안정적 |
| 🟡 개선 필요 | 0.1 \~ 0.25 | 약간의 이동 있음 |
| 🔴 나쁨 | > 0.25 | 사용자 불편함이 큼 |

🛠️ CLS 개선 방법
| 전략 | 설명 |
| ---------------------- | -------------------------------------------------------- |
| ✅ 이미지에 width/height 명시 | `<img width="600" height="400">` |
| ✅ 비디오, iframe도 크기 고정 | layout shift를 방지 |
| ✅ 광고 자리 예약 | 광고 위치에 placeholder 미리 지정 |
| ✅ 웹폰트 최적화 | `font-display: swap` 사용해 FOIT 방지 |
| ✅ 애니메이션 최적화 | `transform`, `opacity` 사용. `top`, `left`, `height` 변경 지양 |
| ✅ Skeleton UI 사용 | 예상 크기의 박스 형태로 미리 공간 차지 |

<br>

**Speed Index: 페이지가 화면에 콘텐츠를 얼마나 빠르고 부드럽게 렌더링하는지를 수치로 나타낸 지표**

🧮 Speed Index 점수 계산 방식  
 Lighthouse가 페이지 렌더링 과정을 녹화하고, 각 시점마다 **화면에 얼마나 콘텐츠가 채워졌는지(시각적 진행률)**를 분석해서 계산

📈 Speed Index 점수 기준
| 점수 | SI 값 (ms) | 평가 |
| -------- | ---------------- | ----------- |
| 🟢 좋음 | ≤ 3,400ms | 빠름 |
| 🟡 개선 필요 | 3,400 \~ 5,800ms | 약간 느림 |
| 🔴 느림 | > 5,800ms | 시각적 렌더링 지연됨 |

🛠️ Speed Index 최적화 방법
| 개선 방법 | 설명 |
| -------------------------------- | ------------------------------------------------- |
| ✅ **이미지 최적화** | WebP 사용, preload 적용, lazy load 비활성화 (LCP 이미지에 한함) |
| ✅ **CSS/JS 최소화** | 불필요한 코드를 제거하고 minify |
| ✅ **렌더링 차단 리소스 제거** | async / defer 스크립트 사용, Critical CSS 인라인 처리 |
| ✅ **서버 응답 시간 개선** | CDN, 캐시, 서버 최적화 |
| ✅ **Skeleton UI 도입** | 콘텐츠 로딩 전 기본 구조를 먼저 보여줘 체감 속도 개선 |
| ✅ **SSR 또는 Static Rendering 도입** | React, Vue 등의 SPA는 서버에서 HTML 먼저 보내도록 변경 |

<br><br>

**📈 6-2. 렌더링 시간**

**S3(정적 호스팅) 렌더링 시간**  
<img width="590" alt="S3(정적 호스팅)" src="https://github.com/user-attachments/assets/14e5c2b8-f09a-43ea-bba5-7afe5566f312" />

<br>

**Cloud Front(CDN) 렌더링 시간**  
<img width="590" alt="Cloud Front(CDN)" src="https://github.com/user-attachments/assets/194bca6f-d295-4764-95ef-343b56ef22e7" />


**전체 렌더링 스크린샷**
<p style="display: flex; gap: 10px;">
  <figure style="text-align: center;">
    <img src="https://github.com/user-attachments/assets/b52d8579-5e9c-40c9-9418-c4c71c1cdd5d" alt="스크린샷2" width="300" />
    <figcaption>[S3(정적 호스팅]</figcaption>
  </figure>

  <figure style="text-align: center;">
    <img src="https://github.com/user-attachments/assets/a00bd5a0-0289-487e-80a7-0f8724ba276a" alt="스크린샷1" width="300" />
    <figcaption>[Cloud Front(CDN)]</figcaption>
  </figure>
</p>

**전체 렌더링 소요 시간**
| 구분 | S3 | CloudFront |
| ---------------- | ----- | ---------- |
| Finish | 6.57s | 6.44s |
| DOMContentLoaded | 133ms | 63ms |
| Load | 353ms | 266ms |

<br><br>

**📊 6-3. Cloud Front(CDN)과 S3(정적 호스팅) 비교 분석**
<img width="640" alt="스크린샷 2025-05-28 오후 12 15 37" src="https://github.com/user-attachments/assets/e266a7ea-df0e-4608-bce9-de359d27d1cc" />

<br><br>

## ✨ 번외 테스트
예전부터 이미지 최적화와 CSR/SSR 간의 성능 차이에 대해 궁금했었는데, 이번 과제를 통해 직접 테스트해보았습니다.

### 🎉 CloudFront(CDN)(이미지 최적화 미사용) vs Vercel(이미지 최적화 사용)
📌 **CloudFront(CDN)**
- **CloudFront 이미지 네트워크 상세화면**
<img width="721" alt="cloudFront_image_노압축" src="https://github.com/user-attachments/assets/3dc34b3e-eb3c-41fd-9bca-f21df89022b5" />   
<br>

이미지 최적화가 안되서 content-type이 image/jpeg를 그대로 반환하고 있습니다.

<br>

- **CloudFront 이미지 네트워크**
<img width="726" alt="cloudFront_image_network" src="https://github.com/user-attachments/assets/52eba1c7-881f-46c9-afdd-b5c2be3602cc" />
<br>

이미지를 받아오는 데 다소 시간이 걸리며, 최종적으로 완료되는 데 약 7.10초가 소요되는 것을 확인할 수 있습니다.

<br>

- **CloudFront lighthouse**
<img width="704" alt="cloudFront_lighthouse" src="https://github.com/user-attachments/assets/c947ef94-ab6d-42e4-914c-4096c22d42a5" />
<br>

<br>

📌 **Vercel**
- **Vercel 이미지 네트워크 상세화면**
<img width="717" alt="vercel_csr_압축" src="https://github.com/user-attachments/assets/2f996c37-fd0c-4819-8d10-6eb6caeeaf6f" />
<br>

이미지 최적화가 되어 content-type이 image/webp로 변환된 것을 확인할 수 있습니다.

<br>

- **Vercel 이미지 네트워크**
<img width="721" alt="vercel_csr_image_network" src="https://github.com/user-attachments/assets/9a8cc550-e237-4b94-a21a-7d34a75eac3d" />
<br>

이미지를 받아오는 데 캐싱으로 인해 소요시간이 적고, 최종적으로 완료되는 데 약 6.70초가 소요되는 것을 확인할 수 있습니다.   

<br>

- **Vercel lighthouse**
<img width="707" alt="vercel_csr_lighthouse" src="https://github.com/user-attachments/assets/bc7205c9-441f-473c-88a7-7b52aa32e1ad" />
<br>

<br><br>


### 🎉 Vercel(CSR) vs Vercel(SSR)
📌 **Vercel(CSR)**
- **Vercel(CSR) 이미지 네트워크**
<img width="721" alt="vercel_csr_image_network" src="https://github.com/user-attachments/assets/102f2ab6-8c2e-4c21-9b16-49b71ef9e407" />
<br>

- **Vercel(CSR) lighthouse**
<img width="707" alt="vercel_csr_lighthouse" src="https://github.com/user-attachments/assets/bc7205c9-441f-473c-88a7-7b52aa32e1ad" />
<br>

<br>

📌 **Vercel(SSR)**
- **Vercel(SSR) 이미지 네트워크**
<img width="722" alt="vercel_ssr_image_network" src="https://github.com/user-attachments/assets/03dcfcfb-6988-48a7-a999-e3bde045f3f8" />
<br>

이미지를 받아오는 데 캐싱으로 인해 소요시간이 적고, 최종적으로 완료되는 데 약 6.35초가 소요되는 것을 확인할 수 있습니다.   

<br>

- **Vercel(SSR) lighthouse**
<img width="708" alt="vercel_ssr_lighthouse" src="https://github.com/user-attachments/assets/8e66e89f-dbce-454f-8e1c-7bebfe0d2cd7" />
<br>

<br>

### 🎉 최종 요약   
| 항목             | CloudFront | Vercel(CSR) | Vercel(SSR) |
|------------------|------------|-------------|-------------|
| Performance      | 🟡 78점     | 🟢 92점      | 🟢 100점     |
| Accessibility    | 🟢 100점    | 🟢 100점     | 🟢 100점     |
| Best Practices   | 🟢 93점     | 🟢 96점      | 🟢 96점      |
| SEO              | 🟢 100점    | 🟡 63점      | 🟡 63점      |
| FCP              | 🟢 ⏱️0.3s   | 🟢 ⏱️0.2s    | 🟢 ⏱️0.2s   |
| LCP              | 🔴 ⏱️3.9s   | 🟡 ⏱️1.8s    | 🟢 ⏱️0.5s   |
| TBT              | 🟢 ⏱️10ms   | 🟢 ⏱️20ms    | 🟢 ⏱️10ms   |
| CLS              | 🟢 ⏱️0      | 🟢 ⏱️0       | 🟢 ⏱️0      |
| Speed Index      | 🟡 ⏱️1.4s   | 🟢 ⏱️1.2s    | 🟢 ⏱️0.2s   |
| 최종 완료시간       | ⏱️ 7.10초   | ⏱️ 6.70초    | ⏱️ 6.35초    |

