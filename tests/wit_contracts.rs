use std::fs;
use std::path::PathBuf;

#[test]
fn canonical_wit_worlds_parse_and_resolve() {
    let contracts = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../contracts/wit");
    let mut worlds = fs::read_dir(&contracts)
        .expect("read WIT contract directory")
        .filter_map(Result::ok)
        .filter(|entry| entry.path().join("world.wit").is_file())
        .map(|entry| entry.path())
        .collect::<Vec<_>>();
    worlds.sort();

    assert_eq!(
        worlds.len(),
        9,
        "locked and candidate WIT inventory changed"
    );
    for path in worlds {
        let mut resolve = wit_parser::Resolve::default();
        resolve
            .push_dir(&path)
            .unwrap_or_else(|error| panic!("{}: {error:#}", path.display()));
    }
}
