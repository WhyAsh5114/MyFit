import { crc32 } from 'node:zlib';

/** Builds a minimal ZIP with stored (uncompressed) files, the shape `zip -r` produces for small files. */
export function buildZip(files: Record<string, string>, comment = ''): Buffer {
	const locals: Buffer[] = [];
	const directory: Buffer[] = [];
	let offset = 0;

	for (const [name, content] of Object.entries(files)) {
		const nameBytes = Buffer.from(name);
		const data = Buffer.from(content);
		const checksum = crc32(data);

		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt32LE(checksum, 14);
		local.writeUInt32LE(data.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(nameBytes.length, 26);
		locals.push(local, nameBytes, data);

		const entry = Buffer.alloc(46);
		entry.writeUInt32LE(0x02014b50, 0);
		entry.writeUInt16LE(20, 4);
		entry.writeUInt16LE(20, 6);
		entry.writeUInt32LE(checksum, 16);
		entry.writeUInt32LE(data.length, 20);
		entry.writeUInt32LE(data.length, 24);
		entry.writeUInt16LE(nameBytes.length, 28);
		entry.writeUInt32LE(offset, 42);
		directory.push(entry, nameBytes);

		offset += local.length + nameBytes.length + data.length;
	}

	const directoryBytes = Buffer.concat(directory);
	const commentBytes = Buffer.from(comment);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(Object.keys(files).length, 8);
	end.writeUInt16LE(Object.keys(files).length, 10);
	end.writeUInt32LE(directoryBytes.length, 12);
	end.writeUInt32LE(offset, 16);
	end.writeUInt16LE(commentBytes.length, 20);

	return Buffer.concat([...locals, directoryBytes, end, commentBytes]);
}
