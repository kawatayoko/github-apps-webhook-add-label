import type { Probot } from "probot";

const LABEL_NAME = "using-ai";
const LABEL_COLOR = "0e8a16"; // GitHub推奨系の緑
const CHECK_TEXT = "[x] AI利用あり";

export default (app: Probot) => {
  app.on(
    [
      "pull_request.opened",
      "pull_request.edited",
      "pull_request.synchronize",
      "pull_request.reopened",
    ],
    async (context) => {
      // ===== DEBUG: ここから =====
    //   try {
    //     const installationId = context.payload.installation?.id;
    //     const { data: appInfo } = await context.octokit.request("GET /app");
    //     context.log.info(
    //       {
    //         appId: appInfo?.id,
    //         slug: appInfo?.slug,
    //         installationId,
    //         repo: context.payload.repository.full_name,
    //       },
    //       "debug identity"
    //     );

    //     const { data: installs } = await context.octokit.request("GET /app/installations");
    //     context.log.info(
    //       { installationIds: installs.map((i: any) => i.id) },
    //       "debug installations visible to this app"
    //     );
    //   } catch (e: any) {
    //     context.log.error(
    //       { status: e?.status, message: e?.message, name: e?.name },
    //       "debug failed"
    //     );
    //   }
      // ===== DEBUG: ここまで =====

      const pr = context.payload.pull_request;
      const owner = context.payload.repository.owner.login;
      const repo = context.payload.repository.name;
      const issue_number = pr.number;

      const body = pr.body ?? "";
      const hasChecked = body.includes(CHECK_TEXT);

      // ラベルの存在確認 → 無ければ作成
      const ensureLabel = async () => {
        try {
          await context.octokit.rest.issues.getLabel({
            owner,
            repo,
            name: LABEL_NAME,
          });
        } catch (e: any) {
          if (e?.status !== 404) throw e;
          await context.octokit.rest.issues.createLabel({
            owner,
            repo,
            name: LABEL_NAME,
            color: LABEL_COLOR,
            description: "PR body indicates AI usage ([x] AI利用あり)",
          });
        }
      };

      if (hasChecked) {
        await ensureLabel();
        await context.octokit.rest.issues.addLabels({
          owner,
          repo,
          issue_number,
          labels: [LABEL_NAME],
        });
      } else {
        // チェックが外れたらラベルも外す
        try {
          await context.octokit.rest.issues.removeLabel({
            owner,
            repo,
            issue_number,
            name: LABEL_NAME,
          });
        } catch (e: any) {
          if (e?.status !== 404) throw e;
        }
      }
    }
  );
};