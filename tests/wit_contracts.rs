use std::path::PathBuf;

const WORLDS: [&str; 5] = [
    "practice-scoring-v1",
    "radar-engine-v1",
    "notebook-core-v1",
    "policy-core-v1",
    "boussole-scoring-v1",
];

#[test]
fn canonical_wit_worlds_parse_and_resolve() {
    let contracts = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../contracts/wit");

    for world in WORLDS {
        let path = contracts.join(world);
        let mut resolve = wit_parser::Resolve::default();
        resolve
            .push_dir(&path)
            .unwrap_or_else(|error| panic!("{}: {error:#}", path.display()));
    }
}
