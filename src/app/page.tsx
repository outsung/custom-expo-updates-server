export default function Home() {
  const account = "[account]";
  const repository = "[repository]";
  const date = "[date]";
  const version = "[version]";

  const list: any[] = [];

  return (
    <main>
      <header>
        <div id="release">
          {account}/<span id="repo">{repository}</span>
        </div>
        <div id="date">{date}</div>
      </header>

      <div id="list">
        {list.map((size, index) => (
          <div className="item" key={index}>
            <div className="fileType">
              {`{{@key}}:`}
              <span className="url">
                <a href="{{this.url}}">/latest/{index}</a>
              </span>
            </div>
            <div className="size">{size} MB</div>
          </div>
        ))}
      </div>

      <footer>
        <div id="version">{version}</div>
        <a id="release-notes" href="{{releaseNotes}}">
          Release Notes
        </a>
        <a id="all-releases" href="{{allReleases}}">
          All Releases
        </a>
        <a href="{{github}}">GitHub</a>
      </footer>
    </main>
  );
}
